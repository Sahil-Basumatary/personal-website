import { buildSystemDrive } from '@/lib/content/build-system-drive';
import { loadPortfolioContent } from '@/lib/content/load-portfolio';
import { HomeClient } from './home-client';

export default async function Home() {
  const { content } = await loadPortfolioContent();
  return <HomeClient root={buildSystemDrive(content)} content={content} />;
}
