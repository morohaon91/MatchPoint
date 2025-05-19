export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small teams getting started.",
      features: [
        "Up to 10 players",
        "2 team events per week",
        "Basic chat and announcements",
      ],
    },
    {
      name: "Pro",
      price: "$9/mo",
      description: "Great for growing teams and clubs.",
      features: [
        "Unlimited players",
        "Unlimited events",
        "Advanced scheduling",
        "Media sharing & stats tracking",
      ],
      highlight: true,
    },
    {
      name: "Elite",
      price: "$29/mo",
      description: "For professional teams and organizations.",
      features: [
        "All Pro features",
        "Custom roles & permissions",
        "Priority support",
        "Integration with external apps",
      ],
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-600 mt-2 mb-12">
          Choose the plan that fits your team’s needs.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-2xl p-6 shadow-sm transition-all ${
                plan.highlight ? "border-blue-600 shadow-lg" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900 my-4">
                {plan.price}
              </p>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="text-left text-sm space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
                {plan.price === "Free" ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
