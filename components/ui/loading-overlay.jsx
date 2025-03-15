export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-4 text-lg font-medium">Generating AI Questions...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait, this may take a few seconds</p>
      </div>
    </div>
  );
}