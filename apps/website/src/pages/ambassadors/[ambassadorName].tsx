import type { GetStaticPaths, GetStaticProps, NextPage } from "next"
import Image from "next/image"
import Head from "next/head"
import React, { useMemo } from "react"

import ambassadors, { type Ambassador, iucnFlags, iucnStatuses } from "../../config/ambassadors"
import Section from "../../components/content/Section"
import Heading from "../../components/content/Heading"
import Carousel from "../../components/content/Carousel"
import { camelToKebab, kebabToCamel } from "../../utils/string-case"

const parseIucnStatus = (rawStatus: string): string => {
  const [ status, flag ] = rawStatus.split("/");

  if (!Object.prototype.hasOwnProperty.call(iucnStatuses, (status as PropertyKey)))
    throw new Error(`Invalid IUCN status: ${status}`);
  if (!flag) return iucnStatuses[(status as keyof typeof iucnStatuses)];

  if (!Object.prototype.hasOwnProperty.call(iucnFlags, (flag as PropertyKey)))
    throw new Error(`Invalid IUCN flag: ${flag}`);
  return `${iucnStatuses[(status as keyof typeof iucnStatuses)]} ${iucnFlags[(flag as keyof typeof iucnFlags)]}`;
};

const parseDate = (date: string | null): string => {
  if (!date) return "Unknown";

  const [ year, month, day ] = date.split("-");
  const parsed = new Date(Number(year), Number(month || 1) - 1, Number(day || 1));

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: month ? "long" : undefined,
    day: day ? "numeric" : undefined,
  });
};

type AmbassadorPageProps = {
  ambassador: Ambassador;
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: Object.keys(ambassadors).map(slug => ({
      params: { ambassadorName: camelToKebab(slug) },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<AmbassadorPageProps> = async (context) => {
  const ambassadorName = context.params?.ambassadorName;
  if (typeof ambassadorName !== "string") return { notFound: true };

  const ambassador = ambassadors[kebabToCamel(ambassadorName)];
  if (!ambassador) return { notFound: true };

  return {
    props: {
      ambassador,
    },
  };
};

const AmbassadorPage: NextPage<AmbassadorPageProps> = ({ ambassador }) => {
  const carousel = useMemo(() => ambassador.images.reduce((obj, { src, alt }) => ({
    ...obj,
    [typeof src === "string" ? src : ('src' in src ? src.src : src.default.src)]: (
      <Image
        src={src}
        alt={alt}
        draggable={false}
        className="object-cover w-full h-auto aspect-square rounded-xl"
      />
    ),
  }), {}), [ ambassador ]);

  return (
    <>
      <Head>
        <title>{`${ambassador.name} | Ambassadors | Alveus.gg`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Nav background */}
      <div className="hidden lg:block bg-alveus-green-900 h-40 -mt-40" />

      <div className="relative">
        <Section className="pt-64 md:pt-0 min-h-[85vh]" containerClassName="flex flex-wrap">
          <Image
            src={ambassador.images[0].src}
            alt={ambassador.images[0].alt}
            className="absolute inset-x-0 top-0 md:bottom-0 object-cover w-full h-64 md:w-1/2 md:h-full"
          />

          <div className="basis-full md:basis-1/2" />

          <div className="basis-full md:basis-1/2 md:max-w-1/2 py-4 md:p-8 flex flex-col">
            <Heading className="text-5xl">{ambassador.name}</Heading>

            <div className="text-xl my-2">
              <p className="my-2">{ambassador.story}</p>
              <p className="my-2">{ambassador.mission}</p>
            </div>

            <div className="flex flex-wrap">
              <div className="basis-full lg:basis-1/2 py-2 lg:px-2">
                <Heading level={2}>IUCN Status:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{parseIucnStatus(ambassador.iucn)}</p>
                </div>
              </div>

              <div className="basis-full lg:basis-1/2 py-2 lg:px-2">
                <Heading level={2}>Species:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{ambassador.species}</p>
                  <p className="text-xl text-alveus-green-600">{ambassador.scientific}</p>
                </div>
              </div>

              <div className="basis-full lg:basis-1/2 py-2 lg:px-2">
                <Heading level={2}>Sex:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{ambassador.sex || 'Unknown'}</p>
                </div>
              </div>

              <div className="basis-full lg:basis-1/2 py-2 lg:px-2">
                <Heading level={2}>Date of Birth:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{parseDate(ambassador.birth)}</p>
                </div>
              </div>

              <div className="basis-full lg:basis-1/2 py-2 lg:px-2">
                <Heading level={2}>Arrived at Alveus:</Heading>

                <div className="ml-4">
                  <p className="text-xl">{parseDate(ambassador.arrival)}</p>
                </div>
              </div>
            </div>

            <Carousel
              items={carousel}
              auto={null}
              className="mt-8"
              basis="basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3 p-2 2xl:p-4"
            />
          </div>
        </Section>
      </div>
    </>
  );
};

export default AmbassadorPage;
