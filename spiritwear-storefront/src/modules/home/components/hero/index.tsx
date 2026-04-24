import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-bold"
          >
            SpiritWear
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Powered by Fluffy Unicorn
          </Heading>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            ===
          </Heading>
          <Heading
            level="h3"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >

            Blah Blah Blah t-shirts blah blah blah hoodies blah blah blah merch
            for individuals and schools.

            Fundraising opportunities for schools and organizations. Custom designs and bulk ordering for teams, clubs, and events. Make Money
          </Heading>
        </span>

      </div>
    </div>
  )
}

export default Hero
