// Utility to fetch active check-ins for a customer
export async function fetchActiveCheckInCustomerIds() {
  try {
    const res = await fetch('/api/checkins/active');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((log: any) => log.customer_id);
  } catch {
    return [];
  }
}
