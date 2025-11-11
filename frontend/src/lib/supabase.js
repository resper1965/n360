import { createClient } from '@supabase/supabase-js'

const getGlobalVar = (key) => {
  if (typeof window !== 'undefined' && window[key]) {
    return window[key]
  }
  return undefined
}

const supabaseUrl = getGlobalVar('SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  getGlobalVar('SUPABASE_ANON_KEY') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, bucket, path, onProgress) {
  try {
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

/**
 * Generate file path for evidence
 * @param {string} orgId - Organization ID
 * @param {string} module - Module name (controls, policies, tickets)
 * @param {string} entityId - Entity ID
 * @param {string} filename - Original filename
 */
export function generateFilePath(orgId, module, entityId, filename) {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${orgId}/${module}/${entityId}/${timestamp}-${sanitized}`
}

/**
 * Upload evidence file
 * @param {File} file - File to upload
 * @param {string} orgId - Organization ID
 * @param {string} module - Module name
 * @param {string} entityId - Entity ID
 * @param {function} onProgress - Progress callback
 */
export async function uploadEvidence(file, orgId, module, entityId, onProgress) {
  const path = generateFilePath(orgId, module, entityId, file.name)
  return uploadFile(file, 'evidences', path, onProgress)
}
