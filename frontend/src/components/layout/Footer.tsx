"use client"

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Grocera</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Sri Lanka&apos;s most advanced retail intelligence platform. Track prices, find discounts, and optimize your basket across multiple supermarkets.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/baskets" className="text-muted-foreground hover:text-primary transition-colors">Baskets</Link></li>
              <li><Link href="/discounts" className="text-muted-foreground hover:text-primary transition-colors">Discounts</Link></li>
              <li><Link href="/scraper" className="text-muted-foreground hover:text-primary transition-colors">Scraper Engine</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Grocera. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-[#06D001]"></span>
            <span className="text-xs font-medium text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
