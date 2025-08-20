import Foundation
import os.log
import NitroModules

/**
 * A singleton helper for resolving MediaPipe model files on iOS.
 * It handles downloading, caching, and accessing models from app bundles.
 * This is the designated "Resource Fetcher" as per the architecture design.
 */
class ModelFileResolver {
    static let shared = ModelFileResolver()
    private let logger = OSLog(subsystem: "Aistack", category: "ModelFileResolver")
    private let modelCacheDir = "aistack_models"

    private init() {}

    /**
     * Resolves a ModelSource to a local file path.
     *
     * @param source The ModelSource object from JavaScript.
     * @return The absolute local file path of the model.
     * @throws Error if the model cannot be resolved.
     */
    func resolve(source: ModelSource) async throws -> String {
        switch source {
        case .first(let uriSource):
            return try await resolveFromUri(uri: uriSource.uri)
        case .second(let bundleSource):
            return try await resolveFromBundle(bundlePath: bundleSource.bundle)
        case .third(let filePathSource):
            return try resolveFromFilePath(filePath: filePathSource.filePath)
        }
    }

    private func resolveFromFilePath(filePath: String) throws -> String {
        let fileURL = URL(fileURLWithPath: filePath)

        guard FileManager.default.fileExists(atPath: filePath) else {
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model file does not exist at path: \(filePath)"])
        }

        
        return fileURL.path
    }

    private func resolveFromBundle(bundlePath: String) async throws -> String {
        let cacheDir = try getCacheDirectory()
        let destinationURL = cacheDir.appendingPathComponent(bundlePath)

        // Check if already cached
        if FileManager.default.fileExists(atPath: destinationURL.path) {
            return destinationURL.path
        }

        // Create intermediate directories if needed
        try FileManager.default.createDirectory(at: destinationURL.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: nil)

        // Find the model in the bundle
        let bundleName = bundlePath.replacingOccurrences(of: ".tflite", with: "")
        guard let bundleURL = Bundle.main.url(forResource: bundleName, withExtension: "tflite") else {
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to load model from bundle: '\(bundlePath)'. Make sure it's in the app bundle."])
        }

        do {
            try FileManager.default.copyItem(at: bundleURL, to: destinationURL)
            return destinationURL.path
        } catch {
            // Clean up partial file if it exists
            if FileManager.default.fileExists(atPath: destinationURL.path) {
                try? FileManager.default.removeItem(at: destinationURL)
            }
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to copy model from bundle: \(error.localizedDescription)"])
        }
    }

    private func resolveFromUri(uri: String) async throws -> String {
        let cacheDir = try getCacheDirectory()
        let filename = URL(string: uri)?.lastPathComponent ?? "model.tflite"
        let destinationURL = cacheDir.appendingPathComponent(filename)
        let partURL = cacheDir.appendingPathComponent("\(filename).part")

        // Check if already cached
        if FileManager.default.fileExists(atPath: destinationURL.path) {
            return destinationURL.path
        }

        guard let url = URL(string: uri) else {
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URI: \(uri)"])
        }

        do {
            let (tempURL, _) = try await URLSession.shared.download(from: url)

            // Move to part file first, then to final destination
            try FileManager.default.moveItem(at: tempURL, to: partURL)
            try FileManager.default.moveItem(at: partURL, to: destinationURL)
            return destinationURL.path
        } catch {
            // Clean up partial files
            if FileManager.default.fileExists(atPath: partURL.path) {
                try? FileManager.default.removeItem(at: partURL)
            }
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to download model from URI: \(uri). Error: \(error.localizedDescription)"])
        }
    }

    private func getCacheDirectory() throws -> URL {
        guard let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else {
            throw NSError(domain: "ModelFileResolver", code: -1, userInfo: [NSLocalizedDescriptionKey: "Unable to access cache directory"])
        }

        let modelCacheURL = cacheDir.appendingPathComponent(modelCacheDir)

        if !FileManager.default.fileExists(atPath: modelCacheURL.path) {
            try FileManager.default.createDirectory(at: modelCacheURL, withIntermediateDirectories: true, attributes: nil)
        }

        return modelCacheURL
    }
}
