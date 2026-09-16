'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare, Mail, Phone, MapPin, Copy, Check, Loader2 } from 'lucide-react';
import { siteConfig } from '../data/data.ts';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([siteConfig.contactTopics[0] || 'Workflow Automation']);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Append Web3Forms access key
    formData.append("access_key", "24ae8b7b-f23a-41b1-920f-9a312415bc40");

    // Include selected focus topics if not already in formData
    if (selectedTopics.length > 0) {
      formData.set("topics", selectedTopics.join(", "));
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStatusType('success');
        setStatusMessage(result.message || "Thank you! Your message has been sent successfully.");
        formElement.reset();
        setName('');
        setCompany('');
        setEmail('');
        setMessage('');
        setSelectedTopics([siteConfig.contactTopics[0] || 'Workflow Automation']);
      } else {
        setStatusType('error');
        setStatusMessage(result.message || "Submission failed. Please try again or reach out via direct email.");
      }
    } catch (error: any) {
      setStatusType('error');
      setStatusMessage(error.message || "Network error occurred. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(siteConfig.contactDetails.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayPhone = siteConfig.contactDetails.phone || siteConfig.contactDetails.studioPhone || '+971 545648341';
  const displayLocation = siteConfig.contactDetails.location || siteConfig.studioNotice.location;

  return (
    <section id="contact" className="py-20 border-b border-neutral-200 relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            <MessageSquare className="w-3 h-3 text-neutral-700" />
            <span>SECTION 04 // ENGAGEMENT CHANNEL</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight font-normal">
            LET'S TALK
          </h2>
        </div>
        <p className="font-sans text-xs sm:text-sm text-neutral-600 max-w-md font-light leading-relaxed">
          Custom digital platforms, autonomous task orchestration, and high-impact visual storytelling. Accepting select Q3/Q4 commissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Mad-Libs Sentence Form (8 cols) */}
        <div className="lg:col-span-8">
          <form
            id="contact-mad-libs-form"
            onSubmit={handleSubmit}
            className="p-8 sm:p-10 rounded-xl border border-neutral-300/90 bg-neutral-100/40 shadow-xs space-y-8"
          >
            {/* Mad Libs Sentence Flow */}
            <div className="font-serif text-2xl sm:text-3xl text-neutral-950 leading-[1.6] space-y-4">
              <div>
                My name is{' '}
                <input
                  id="input-contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="[your name]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="inline-block border-b-2 border-neutral-900 bg-transparent px-2 py-0.5 text-neutral-950 font-sans text-xl sm:text-2xl focus:outline-hidden focus:border-emerald-600 placeholder:text-neutral-400 min-w-[180px] sm:min-w-[240px]"
                />{' '}
                from{' '}
                <input
                  id="input-contact-company"
                  name="company"
                  type="text"
                  placeholder="[studio / organization]"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="inline-block border-b-2 border-neutral-900 bg-transparent px-2 py-0.5 text-neutral-950 font-sans text-xl sm:text-2xl focus:outline-hidden focus:border-emerald-600 placeholder:text-neutral-400 min-w-[200px] sm:min-w-[260px]"
                />
                .
              </div>

              <div className="text-xl sm:text-2xl">
                Reach me at{' '}
                <input
                  id="input-contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="[your email address]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="inline-block border-b-2 border-neutral-900 bg-transparent px-2 py-0.5 text-neutral-950 font-sans text-xl sm:text-2xl focus:outline-hidden focus:border-emerald-600 placeholder:text-neutral-400 min-w-[220px] sm:min-w-[280px]"
                />
                .
              </div>

              <div>
                Let's talk about{' '}
                <span className="font-sans text-base sm:text-lg text-neutral-600 block sm:inline mt-2 sm:mt-0">
                  (select one or multiple focus topics below):
                </span>
              </div>
            </div>

            {/* Topic Selectors: Mapped directly to siteConfig.contactTopics */}
            <div id="contact-topic-selectors" className="flex flex-wrap gap-2.5 pt-1 pb-2">
              {siteConfig.contactTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    id={`topic-btn-${topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3.5 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all border ${
                      isSelected
                        ? 'bg-neutral-950 text-neutral-50 border-neutral-950 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-700 hover:text-neutral-950'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* Hidden field for selected topics */}
            <input type="hidden" name="topics" value={selectedTopics.join(', ')} />

            {/* Textarea Message */}
            <div className="space-y-2">
              <label
                htmlFor="input-contact-message"
                className="font-serif text-xl sm:text-2xl text-neutral-950 block"
              >
                Here is my message / project briefing:
              </label>
              <textarea
                id="input-contact-message"
                name="message"
                rows={4}
                required
                placeholder="Describe project parameters, automation workflows, web platform scope, or target timeline..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-4 font-sans text-sm text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 placeholder:text-neutral-400 leading-relaxed shadow-inner"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md bg-neutral-950 text-neutral-50 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Inquiry</span>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                100% CLIENT-SIDE PROTOCOL // WEB3FORMS INTEGRATION
              </span>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                id="contact-status-feedback"
                className={`p-3.5 rounded-md font-mono text-xs flex items-center gap-2.5 border ${
                  statusType === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-red-50 text-red-900 border-red-300'
                }`}
              >
                {statusType === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Direct Studio Contact Details (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
          <div className="p-6 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-3">
              DIRECT DESK CHANNELS
            </div>

            {/* Email with copy action */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-neutral-600" />
                ELECTRONIC MAIL
              </span>
              <div className="flex items-center justify-between">
                <a
                  href={`mailto:${siteConfig.contactDetails.email}`}
                  id="contact-direct-email"
                  className="font-mono text-xs text-neutral-950 hover:underline break-all font-medium"
                >
                  {siteConfig.contactDetails.email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                  title="Copy email to clipboard"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-neutral-600" />
                STUDIO TELEPHONY
              </span>
              <a
                href={`tel:${displayPhone}`}
                className="font-mono text-xs text-neutral-950 hover:underline block"
              >
                {displayPhone}
              </a>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-neutral-600" />
                STUDIO PRESENCE
              </span>
              <p className="font-mono text-xs text-neutral-950">
                {displayLocation}
              </p>
              <p className="font-mono text-[9px] text-neutral-400">
                {siteConfig.studioNotice.coordinates}
              </p>
            </div>
          </div>

          {/* Quick Dispatch Card */}
          <div className="p-6 rounded-xl border border-neutral-200 bg-neutral-100/50 space-y-3 font-mono text-xs">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">
              OPERATIONAL STATUS
            </div>
            <p className="text-neutral-800 text-[11px] leading-relaxed">
              {siteConfig.studioNotice.status}
            </p>
            <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider">
              {siteConfig.studioNotice.year || 'EST. 2026'} // {siteConfig.siteSubtitle}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
