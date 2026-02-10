'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(249,115,22,0.12),transparent)]" />
        
        <div className="mx-auto max-w-4xl text-center">
          {/* Lobster emoji */}
          <div className="mb-8 text-7xl animate-float">🦞</div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Your AI Assistant
            <br />
            <span className="gradient-text">in 60 Seconds</span>
          </h1>
          
          <p className="mt-6 text-xl leading-8 text-gray-400">
            OpenClaw is the open-source AI that actually does things.
            <br />
            We handle the setup. You just chat.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/onboard"
              className="rounded-full bg-lobster-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-lobster-400 transition-all glow"
            >
              Deploy Now — Free
            </Link>
            <Link href="#how-it-works" className="text-lg font-semibold leading-6 text-gray-300 hover:text-white">
              How it works <span aria-hidden="true">→</span>
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            7-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-16">
            Three Steps. That's It.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Telegram Bot',
                description: 'Open Telegram, message @BotFather, get a token. Takes 2 minutes.',
                icon: '🤖'
              },
              {
                step: '2',
                title: 'Paste Your Token',
                description: 'We validate it works and configure everything automatically.',
                icon: '🔑'
              },
              {
                step: '3',
                title: 'Start Chatting',
                description: 'Your AI assistant is live. Ask it anything, automate everything.',
                icon: '💬'
              }
            ].map((item) => (
              <div key={item.step} className="relative bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-lobster-500/50 transition-colors">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-lobster-500 rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It Can Do */}
      <section className="py-24 px-6 bg-gray-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            One Assistant, Endless Possibilities
          </h2>
          <p className="text-center text-gray-400 mb-16">
            OpenClaw doesn't just answer questions. It takes action.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              '📧 Manage your inbox',
              '📅 Schedule meetings',
              '📝 Take notes',
              '🔍 Research anything',
              '💻 Write code',
              '📊 Analyze data',
              '🌐 Browse the web',
              '⚡ Automate tasks',
              '📱 Control smart home',
              '💰 Track expenses',
              '✈️ Book travel',
              '🎨 Create content'
            ].map((item) => (
              <div key={item} className="bg-gray-900 rounded-lg px-4 py-3 text-sm border border-gray-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-16">
            Simple, Transparent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold">Free Trial</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-gray-400"> / 7 days</span>
              </div>
              <ul className="mt-8 space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Full OpenClaw access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Free AI (Groq)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Telegram integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-600">✗</span> No credit card
                </li>
              </ul>
              <Link href="/onboard" className="mt-8 block w-full rounded-lg bg-gray-800 py-3 text-center font-semibold hover:bg-gray-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
            
            {/* Starter */}
            <div className="bg-gray-900 rounded-2xl p-8 border-2 border-lobster-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lobster-500 px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold">Starter</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹199</span>
                <span className="text-gray-400"> / month</span>
              </div>
              <ul className="mt-8 space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Bring your own AI key
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Daily backups
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority support
                </li>
              </ul>
              <Link href="/onboard?plan=starter" className="mt-8 block w-full rounded-lg bg-lobster-500 py-3 text-center font-semibold hover:bg-lobster-400 transition-colors">
                Get Started
              </Link>
            </div>
            
            {/* Pro */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-gray-400"> / month</span>
              </div>
              <ul className="mt-8 space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Everything in Starter
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 2x resources
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Custom domain
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> WhatsApp support
                </li>
              </ul>
              <Link href="/onboard?plan=pro" className="mt-8 block w-full rounded-lg bg-gray-800 py-3 text-center font-semibold hover:bg-gray-700 transition-colors">
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="font-semibold">2OpenClaw</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built with ❤️ • Powered by <a href="https://openclaw.ai" className="text-lobster-500 hover:underline">OpenClaw</a>
          </p>
        </div>
      </footer>
    </main>
  )
}
