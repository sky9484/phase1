export default function Footer() {
  return (
    <footer className="mt-24 bg-[#326273] py-12 text-[#F6F0ED]/80">
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-4">
        <div>
          <div className="mb-3 text-2xl font-extrabold text-white">
            SPLASH<span className="text-[#5C9EAD]">.</span>
          </div>
          <p className="text-sm">B2B global trade & settlement on Sui.</p>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>Batch Payout</li>
            <li>Cross-Border Transfer</li>
            <li>Global Corridors</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Compliance</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Compliance</h4>
          <p className="text-xs">Splash operates under the Bank Negara MSB framework application process. Splash is not a deposit-taking institution.</p>
        </div>
      </div>
    </footer>
  );
}
