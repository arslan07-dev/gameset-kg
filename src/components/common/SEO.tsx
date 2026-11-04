import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'video.other' | 'game';
  ogImage?: string;
  gameData?: {
    name: string;
    genre: string;
    patchVersion?: string;
    activePlayers?: string;
  };
  breadcrumbs?: Array<{ name: string; item: string }>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage,
  gameData,
  breadcrumbs,
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Resolve Canonical & Full URL
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gameset.kg';
    const currentPath = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const fullUrl = `${origin}${currentPath}`;

    // Resolve Image URL
    const defaultImage = `${origin}/src/assets/images/hero_gaming_esports_1793642581057.jpg`;
    let resolvedImage = defaultImage;
    if (ogImage) {
      resolvedImage = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;
    }

    // 3. Set standard Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setLinkTag('canonical', fullUrl);

    // 4. Set OpenGraph Meta Tags
    setMetaTag('property', 'og:site_name', 'GAMESET KG');
    setMetaTag('property', 'og:type', ogType === 'game' ? 'website' : ogType);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:image', resolvedImage);
    setMetaTag('property', 'og:locale', language === 'ru' ? 'ru_RU' : 'en_US');

    // 5. Set Twitter / X Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', resolvedImage);

    // 6. Dynamic Schema.org JSON-LD
    const graph: any[] = [
      {
        '@type': 'WebApplication',
        '@id': `${fullUrl}#webapp`,
        name: title,
        url: fullUrl,
        applicationCategory: 'GameApplication, UtilitiesApplication',
        operatingSystem: 'Android, iOS',
        description,
        publisher: {
          '@type': 'Organization',
          name: 'GAMESET KG',
          url: origin,
          logo: {
            '@type': 'ImageObject',
            url: defaultImage,
          },
        },
        author: {
          '@type': 'Person',
          name: 'Arslan',
          url: 'https://t.me/arslan_019',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ];

    // If specific game data is provided, add VideoGame Schema
    if (gameData) {
      graph.push({
        '@type': 'VideoGame',
        '@id': `${fullUrl}#game`,
        name: gameData.name,
        description,
        genre: gameData.genre,
        gamePlatform: ['Android', 'iOS'],
        operatingSystem: 'Android, iOS',
        url: fullUrl,
        image: resolvedImage,
        version: gameData.patchVersion,
        publisher: {
          '@type': 'Organization',
          name: 'GAMESET KG',
        },
      });
    }

    // Add BreadcrumbList Schema if breadcrumbs are present
    if (breadcrumbs && breadcrumbs.length > 0) {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${fullUrl}#breadcrumbs`,
        itemListElement: breadcrumbs.map((bc, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: bc.name,
          item: bc.item.startsWith('http') ? bc.item : `${origin}${bc.item}`,
        })),
      });
    }

    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });

    let scriptElement = document.getElementById('dynamic-seo-ld-json') as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'dynamic-seo-ld-json';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = jsonLdContent;
  }, [title, description, keywords, canonicalPath, ogType, ogImage, gameData, breadcrumbs, language]);

  return null;
};
