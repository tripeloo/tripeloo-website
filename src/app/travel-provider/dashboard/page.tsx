export default function Dashboard() {

  const stats = [
    { title: "Total Trips", value: 24 },
    { title: "Active Bookings", value: 12 },
    { title: "Customers", value: 86 },
    { title: "Revenue", value: "$4200" }
  ];

  const trips = [
    { name: "Goa Beach Tour", status: "Active", bookings: 8 },
    { name: "Kerala Backwater Trip", status: "Active", bookings: 5 },
    { name: "Dubai Desert Safari", status: "Upcoming", bookings: 3 }
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>Travel Provider Dashboard</h1>

      <h2>Statistics</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        {stats.map((stat, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "20px", width: "150px" }}>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "40px" }}>Trips</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Trip Name</th>
            <th>Status</th>
            <th>Bookings</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip, index) => (
            <tr key={index}>
              <td>{trip.name}</td>
              <td>{trip.status}</td>
              <td>{trip.bookings}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}