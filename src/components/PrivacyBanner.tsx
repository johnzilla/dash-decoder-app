export function PrivacyBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-muted/90 backdrop-blur-sm border-t py-2 px-4">
      <p className="text-xs text-muted-foreground text-center">
        We use AI to analyze your photo. We collect anonymous usage data to improve the app. No personal info is stored.
      </p>
    </div>
  );
}
