"use client"

import { useState } from 'react';
import { api } from '@/lib/api';
import { Play, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ScraperControlPage() {
  const [store, setStore] = useState('Keells');
  const [categoryUrl, setCategoryUrl] = useState('https://www.keellssuper.com/product/category/all');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const triggerScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await api.post('/scraping/trigger', { store, categoryUrl });
      setStatus('success');
      setMessage(res.data.message || 'Scraping job queued successfully! Products will appear soon.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to trigger scraper.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scraper Engine</h1>
        <p className="text-sm text-muted-foreground">
          Manually trigger the Playwright workers to scrape supermarkets.
        </p>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Job Dispatcher</h2>
              <p className="text-sm text-muted-foreground">Push a new job into the BullMQ queue</p>
            </div>
          </div>
        </div>

        <form onSubmit={triggerScrape} className="p-6 space-y-4">
          {status === 'success' && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Supermarket</label>
            <select
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="Keells">Keells</option>
              <option value="Cargills">Cargills</option>
              <option value="Arpico">Arpico</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category URL to Scrape</label>
            <input
              type="url"
              value={categoryUrl}
              onChange={(e) => setCategoryUrl(e.target.value)}
              placeholder="https://..."
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground px-6 py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {status === 'loading' ? 'Dispatching Job...' : 'Start Scraper Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
