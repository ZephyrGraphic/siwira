export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppLink(
  phone: string,
  productName: string,
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.substring(1)
    : cleanPhone;
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan produk "${productName}" di HMSI UMKM Marketplace. Apakah masih tersedia?`,
  );
  return `https://wa.me/${formattedPhone}?text=${message}`;
}

export function generateWhatsAppCartLink(
  phone: string,
  items: { name: string; quantity: number; price: number }[],
  totalPrice: number,
  buyerName?: string,
  note?: string,
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.substring(1)
    : cleanPhone;

  let msg = `🛒 *Pesanan dari SIWIRA*\n`;
  if (buyerName) msg += `Pembeli: ${buyerName}\n`;
  msg += `\n`;

  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}\n`;
    msg += `   ${item.quantity}x @ ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n`;
  });

  msg += `\n💰 *Total: ${formatPrice(totalPrice)}*\n`;
  if (note) msg += `\n📝 Catatan: ${note}\n`;
  msg += `\nDipesan melalui SIWIRA - Pasar Digital HMSI`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
