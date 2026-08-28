export default function ToolsLayout({ children }: LayoutProps<"/tools">) {
  return (
    <div className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      {children}
    </div>
  );
}
