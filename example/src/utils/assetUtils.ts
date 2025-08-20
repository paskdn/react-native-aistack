import type {
  AssetSource,
  UriAssetSource,
  FilePathAssetSource,
} from 'react-native-aistack';

export function getAssetUri(assetSource: AssetSource): string | undefined {
  if ((assetSource as UriAssetSource).uri) {
    return (assetSource as UriAssetSource).uri;
  }
  if ((assetSource as FilePathAssetSource).filePath) {
    return `file://${(assetSource as FilePathAssetSource).filePath}`;
  }
  // If it's a bundled asset, and it's a number (from require), resolve it.
  // If it's a string path within the bundle, it might need a specific prefix.
  // For simplicity, let's assume it's either URI or FilePath for now.
  // If the native module returns a bundle string, this might need adjustment.
  return undefined;
}
