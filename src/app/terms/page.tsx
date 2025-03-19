"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8"><strong>Effective Date:</strong> 19/03/2025</p>
          
          <p>Welcome to Qubit AI! These Terms of Service ("Terms") govern your access and use of our
          website, application, and services. By using Qubit AI, you agree to comply with these Terms. If
          you do not agree, please do not use our services.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Qubit AI, you acknowledge that you have read, understood, and agreed
          to these Terms. We reserve the right to update these Terms at any time, and continued use of
          the platform constitutes acceptance of any modifications.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Services</h2>
          <p>You agree to use Qubit AI only for lawful purposes and in compliance with all applicable laws.
          You must not:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use our services to engage in illegal, harmful, or unethical activities.</li>
            <li>Interfere with the security or integrity of the platform.</li>
            <li>Attempt to reverse engineer or exploit our AI model, APIs, or other features.</li>
            <li>Misrepresent yourself or use another person's credentials.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration & Security</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Some features may require account creation. You are responsible for keeping your
            credentials secure.</li>
            <li>We reserve the right to suspend or terminate accounts that violate our Terms.</li>
            <li>You must be at least 13 years old to use Qubit AI.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. AI-Generated Content</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Qubit AI provides AI-generated responses, which are for informational purposes only.</li>
            <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated content.</li>
            <li>Users should verify critical information before relying on AI suggestions.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Privacy & Data Usage</h2>
          <p>We value your privacy. Please refer to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details on how we collect, store,
          and process user data.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Qubit AI and all associated content (logos, design, software) are the property of Qubit AI or
            its licensors.</li>
            <li>You may not copy, modify, or distribute any part of our platform without permission.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Qubit AI is provided "as is" without warranties of any kind.</li>
            <li>We are not responsible for any direct, indirect, or incidental damages arising from the use of
            our platform.</li>
            <li>We do not guarantee uninterrupted access to our services.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
          <p>We may terminate or restrict access to our services if a user violates these Terms. Users may
          also discontinue using the service at any time.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
          <p>We may update these Terms periodically. Any changes will be effective immediately upon
          posting. Users are responsible for reviewing the latest version of the Terms.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:nourhazzouri55@gmail.com" className="text-primary hover:underline">nourhazzouri55@gmail.com</a></p>
          
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Last updated: March 19, 2024</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}