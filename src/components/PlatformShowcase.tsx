import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
  tags?: string[];
}

interface Blog8Props {
  heading?: string;
  description?: string;
  posts?: Post[];
}

const TypewriterEffect = () => {
  const steps = [
    "1 Create targeted campaigns with NFT contract addresses, set custom tracking parameters, define conversion goals, and configure audience segmentation for precise Web3 marketing attribution",
    "2 Generate trackable links for Discord and Twitter with encrypted metadata, unique user identification, click-through analytics, and seamless wallet connection monitoring across all social platforms", 
    "3 Share links with influencers and track wallet clicks, monitor engagement rates, analyze conversion funnels, measure reach effectiveness, and identify top-performing content creators in real-time",
    "4 Monitor real-time NFT purchases and calculate ETH revenue attribution, track transaction flows, analyze wallet behavior patterns, generate ROI reports, and optimize campaigns based on blockchain data"

  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentStep = steps[currentStepIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentStep.length) {
          setCurrentText(currentStep.slice(0, currentText.length + 1));
        } else {
          // Pause at the end, then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Move to next step
          setIsDeleting(false);
          setCurrentStepIndex((prev) => (prev + 1) % steps.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentStepIndex, steps]);

  return (
    <p className="mt-4 text-muted-foreground md:mt-5 h-[4rem] flex items-start" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif', whiteSpace: 'pre-line' }}>
      <span>
        {currentText}
        <span className="animate-pulse">|</span>
      </span>
    </p>
  );
};

const PlatformShowcase = ({
  heading = "SociaTrack Platform",
  description = "Connect your social media campaigns directly to blockchain transactions and track real revenue attribution.",
  posts = [
    {
      id: "post-1",
      title: "Track Social Media to Blockchain Attribution",
      summary: "SociaTrack bridges your social content and your blockchain transactions. By combining AI, social media and on-chain data, SociaTrack tells you exactly which post, tweet, or message drove real revenue or mints.",
      label: "Web3 Marketing",
      author: "SociaTrack Team",
      published: "Dec 2024",
      url: "#",
      image: "/SOCIATRACK-ADD.png",
      tags: ["NFT Targeting", "Link Tracking","Influencer Insights","NFT Analytics"],
    },
  ],
}: Blog8Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto max-w-7xl flex flex-col items-center gap-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="mb-6 text-3xl font-semibold md:text-4xl lg:text-5xl" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {heading}
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {description}
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-0 bg-transparent shadow-none"
            >
              <div className="grid gap-y-6 sm:grid-cols-12 sm:gap-x-5 sm:gap-y-0 md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-6 sm:col-start-1">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {post.tags?.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {post.title}
                  </h3>
                  <TypewriterEffect />
                </div>
                <div className="order-first sm:order-last sm:col-span-5 sm:col-start-8">
                  <div className="aspect-[16/9] overflow-clip rounded-lg border border-border">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-opacity duration-200 fade-in"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { PlatformShowcase };