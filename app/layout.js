export const metadata = {
  title: "AI Fast Start · Phase 0 Diagnostic — Yite Labs",
  description:
    "A baseline read on where your business actually sits with AI, and the first win to chase. By Yite Labs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
