import Foundation
import OSLog
import NitroModules

class TextClassifier: HybridTextClassifierSpec {

    private var isInitialized: Bool = false

    func initialize(source: ModelSource, options: TextClassifierOptions?) throws -> Promise<Void> {
        return Promise.async {
            // Simulate initialization with a small delay
            try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            self.isInitialized = true
            
        }
    }

    func unload() throws -> Void {
        isInitialized = false
        
    }

    func classify(text: String) throws -> Promise<TextClassifierResult> {
        return Promise.async {
            guard self.isInitialized else {
                throw NSError(domain: "TextClassifier", code: -1, userInfo: [NSLocalizedDescriptionKey: "TextClassifier is not initialized. Call initialize() first."])
            }

            // Return hardcoded classification results for testing
            let categories: [Category] = [
                Category(
                    index: 0,
                    score: 0.85,
                    displayName: "Positive",
                    categoryName: "positive"
                ),
                Category(
                    index: 1,
                    score: 0.15,
                    displayName: "Negative",
                    categoryName: "negative"
                )
            ]

            
            
            return TextClassifierResult(classifications: categories)
        }
    }
}
