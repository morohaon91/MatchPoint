export default function Features() {
  const features = [
    {
      title: "Team Scheduling",
      description:
        "Easily plan practices, games, and team events with automated reminders.",
      emoji: "📅",
    },
    {
      title: "Player Management",
      description:
        "Track player stats, attendance, and availability all in one place.",
      emoji: "🧍‍♂️🧍‍♀️",
    },
    {
      title: "Score Tracking",
      description:
        "Record scores and performance to review team progress over time.",
      emoji: "📈",
    },
    {
      title: "Group Chat & Announcements",
      description:
        "Keep your team connected with built-in messaging and announcements.",
      emoji: "💬",
    },
    {
      title: "Custom Roles & Permissions",
      description:
        "Assign roles like coach, player, and manager with role-based access.",
      emoji: "🛡️",
    },
    {
      title: "Media Sharing",
      description:
        "Upload and share match photos, highlight videos, and training clips.",
      emoji: "📸",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Features Built for Sports Teams
        </h2>
        <p className="text-gray-600 mt-2 mb-12">
          Everything you need to organize, connect, and grow your sports group.
        </p>
        <div className="grid md:grid-cols-2 gap-10 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start space-x-4">
              <div className="text-4xl">{feature.emoji}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
