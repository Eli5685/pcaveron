import { createClient } from '@supabase/supabase-js'

// Robust environment variable parsing with defensive programming
const __IS_DEV__ = process.env.NODE_ENV !== 'production'

const getEnvVar = (key, fallback = null) => {
  try {
    const value = process.env[key]
    if (!value || value.trim() === '') {
      if (__IS_DEV__) {
        console.warn(`⚠️ Environment variable '${key}' is missing or empty`)
      }
      return fallback
    }
    return value.trim()
  } catch (error) {
    if (__IS_DEV__) {
      console.error(`❌ Error reading environment variable '${key}':`, error)
    }
    return fallback
  }
}

const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY')

// Validation with clear error messages
if (!supabaseUrl || !supabaseAnonKey) {
  if (__IS_DEV__) {
    const missingVars = [
      !supabaseUrl && 'REACT_APP_SUPABASE_URL',
      !supabaseAnonKey && 'REACT_APP_SUPABASE_ANON_KEY'
    ].filter(Boolean)
    console.error('❌ Missing Supabase configuration:', missingVars.join(', '))
  }
  throw new Error('Missing Supabase configuration')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  if (__IS_DEV__) {
    console.error('❌ Invalid Supabase URL format')
  }
  throw new Error('REACT_APP_SUPABASE_URL must be a valid URL')
}

// Do not log sensitive configuration in production
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database API functions
export const api = {
  // Get all products
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  },

  // Get product by ID
  async getProduct(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },

  // Search products
  async searchProducts(query) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  },

  // Get all categories (from categories table)
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name,is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      if (error) throw error
      
      const names = (data || [])
        .map((row) => row?.name)
        .filter((name) => !!name && String(name).trim().length > 0)
      return names
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }
}

export default supabase