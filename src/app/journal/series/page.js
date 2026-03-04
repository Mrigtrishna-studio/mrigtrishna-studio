import { redirect } from 'next/navigation';

export default function SeriesIndexPage() {
  // Instantly redirects the user to the main gallery
  redirect('/journal');
}