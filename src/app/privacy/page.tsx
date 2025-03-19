"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8"><strong>Effective Date:</strong> 19/03/2025</p>
          
          <p>Welcome to Qubit AI! Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal data when you use our website and services.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>We may collect the following types of data when you use Qubit AI:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">a. Information You Provide</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, email address, and login credentials when you create an account.</li>
            <li>Messages, queries, or feedback you submit through our platform.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the collected data to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services.</li>
            <li>Personalize your experience on Qubit AI.</li>
            <li>Monitor and prevent fraudulent or unauthorized activities.</li>
            <li>Analyze user behavior to improve AI performance and user experience.</li>
            <li>Communicate updates, announcements, or support responses.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Share Your Information</h2>
          <p>We do not sell your personal data. However, we may share information in the following
          cases:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Service Providers:</strong> We may work with trusted partners to assist with hosting, analytics, or
            AI processing.</li>
            <li><strong>Legal Compliance:</strong> If required by law or governmental request, we may disclose user data.</li>
            <li><strong>Business Transfers:</strong> If Qubit AI is acquired or merged, user data may be transferred as
            part of the business.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data from unauthorized
          access, disclosure, or loss. However, no online system is 100% secure, and users should take
          precautions when sharing information online.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Privacy Rights</h2>
          <p>Depending on your location, you may have rights regarding your personal data, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Accessing, updating, or deleting your personal information.</li>
            <li>Restricting or objecting to certain types of data processing.</li>
            <li>Opting out of marketing communications.</li>
          </ul>
          <p>For data-related requests, contact us at <a href="mailto:nourhazzouri55@gmail.com" className="text-primary hover:underline">nourhazzouri55@gmail.com</a>.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies & Tracking Technologies</h2>
          <p>We use cookies and tracking tools (e.g., Google Analytics) to enhance user experience and
          analyze site performance. You can manage cookie preferences through your browser settings.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Third-Party Links & Services</h2>
          <p>Qubit AI may contain links to third-party websites. We are not responsible for their privacy
          policies, so please review them separately.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page, and
          continued use of our services constitutes acceptance of any modifications.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>For any privacy-related concerns or questions, reach out to us at:
          <br /><a href="mailto:nourhazzouri55@gmail.com" className="text-primary hover:underline">nourhazzouri55@gmail.com</a></p>
          
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Last updated: March 19, 2024</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}