export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-black text-zinc-100">{children}</div>;
}