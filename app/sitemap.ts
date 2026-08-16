import { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/woocommerce'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ayodhyasattva.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const staticRoutes = [
    '',
    '/products',
    '/contact',
    '/faqs',
    '/returns-policy',
    '/shipping-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Fetch Products
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const productsRes = await getProducts({ per_page: 100 })
    productRoutes = productsRes.data.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.date_modified || product.date_created || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch (error) {
    console.error("Failed to generate product sitemaps", error)
  }

  // 3. Fetch Categories
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const categories = await getCategories()
    categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Failed to generate category sitemaps", error)
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
