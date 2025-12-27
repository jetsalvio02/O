import CustomerNavbar from "./components/Customer_Navbar";

export default function Customer_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomerNavbar />
      <main className="p-4 max-x-7xl mx-auto">{children}</main>
    </>
  );
}
