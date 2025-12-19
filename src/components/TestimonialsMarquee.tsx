import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

// Custom CSS for marquee animation
const marqueeStyle = `
  @keyframes marquee {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-100%);
    }
  }
  
  .animate-marquee {
    animation: marquee var(--duration) linear infinite;
  }
`

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-8 text-start sm:p-10",
        "hover:from-muted/60 hover:to-muted/20",
        "max-w-[480px] sm:max-w-[480px]",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-xl font-semibold leading-none" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {author.name}
          </h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-lg mt-4 text-base text-muted-foreground" style={{ fontFamily: '"Mona Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        {text}
      </p>
    </Card>
  )
}

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
  titleStyle?: React.CSSProperties
  descriptionStyle?: React.CSSProperties
}

export function TestimonialsMarquee({ 
  title,
  description,
  testimonials,
  className,
  titleStyle,
  descriptionStyle 
}: TestimonialsSectionProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
      <section className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-6 sm:px-8 lg:px-12",
        className
      )}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:gap-16">
          <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
            <h2 className="max-w-[900px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight" style={titleStyle}>
              {title}
            </h2>
            <p className="text-md max-w-[800px] font-medium text-muted-foreground sm:text-xl" style={descriptionStyle}>
              {description}
            </p>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <div className="group flex overflow-hidden p-0 flex-row">
              <div className="flex animate-marquee [gap:1.5rem] group-hover:[animation-play-state:paused] [--duration:300s]">
                {[...Array(20)].map((_, setIndex) => (
                  testimonials.map((testimonial, i) => (
                    <TestimonialCard 
                      key={`${setIndex}-${i}`}
                      {...testimonial}
                      className="flex-shrink-0 min-w-[480px]"
                    />
                  ))
                ))}
              </div>
              <div className="flex animate-marquee [gap:1.5rem] group-hover:[animation-play-state:paused] [--duration:300s]">
                {[...Array(20)].map((_, setIndex) => (
                  testimonials.map((testimonial, i) => (
                    <TestimonialCard 
                      key={`duplicate-${setIndex}-${i}`}
                      {...testimonial}
                      className="flex-shrink-0 min-w-[480px]"
                    />
                  ))
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
          </div>
        </div>
      </section>
    </>
  )
}