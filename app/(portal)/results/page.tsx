import { redirect } from 'next/navigation'

export default function ResultsIndex() {
  // Automatically send everyone to the upload page for now
  // Later, we can make this a dashboard where Students see their grades
  // and Teachers see the upload button.
  redirect('/results/upload')
}