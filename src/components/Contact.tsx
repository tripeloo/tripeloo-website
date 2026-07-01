"use client";

import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    id: 1,
    icon: <Mail className="text-sky-500 w-8 h-8 mt-1" />,
    title: "Email Us",
    details: ["support@tripeloo.com"],
  },
  {
    id: 2,
    icon: <Phone className="text-green-500 w-8 h-8 mt-1" />,
    title: "Call Us",
    details: ["90379179463"],
  },
  {
    id: 3,
    icon: <MapPin className="text-pink-500 w-8 h-8 mt-1" />,
    title: "Visit Us",
    details: ["South Beach, Calicut", "Kerala"],
  },
];

export default function ContactSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6 flex flex-col md:flex-row gap-8 justify-center items-center">
        {contactInfo.map(({ id, icon, title, details }) => (
          <div
            key={id}
            className=" bg-white shadow-md rounded-xl p-8 flex items-start gap-4 w-full md:w-1/3 hover:shadow-lg transition"
          >
            {icon}
            <div className="text-start">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {title}
              </h3>
              {details.map((line, index) => (
                <p key={index} className="text-gray-600 text-lg">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Feel free to connect with us
        </h2>

        <form className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="border border-gray-200 rounded-md p-4 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="text"
              placeholder="Your Phone Number"
              className="border border-gray-200 rounded-md p-4 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <input
            type="text"
            placeholder="Your Subject"
            className="border border-gray-200 rounded-md p-4 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <textarea
            rows={6}
            placeholder="Your Subject..."
            className="border border-gray-200 rounded-md p-4 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
          ></textarea>

          <div className="text-left">
            <button
              type="submit"
              className="bg-[#E51A4B] hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-md shadow-md transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
