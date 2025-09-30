// =====================================================
// SUPABASE CONNECTION TEST COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react'
import { testConnection, supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle, XCircle, Loader2, Database, Cloud, Zap } from 'lucide-react'

interface ConnectionStatus {
  supabase: boolean | null
  cloudinary: boolean | null
  database: boolean | null
}

export function SupabaseTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: null,
    cloudinary: null,
    database: null
  })
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<any>(null)

  const testAllConnections = async () => {
    setLoading(true)
    setStatus({ supabase: null, cloudinary: null, database: null })

    try {
      // Test Supabase connection
      console.log('🔄 Testing Supabase connection...')
      const supabaseTest = await testConnection()
      setStatus(prev => ({ ...prev, supabase: supabaseTest.success }))

      if (supabaseTest.success) {
        console.log('✅ Supabase connection successful!')
        
        // Test database tables
        console.log('🔄 Testing database tables...')
        const { data: categories, error: categoriesError } = await supabase
          .from('art_categories')
          .select('*')
          .limit(5)

        setStatus(prev => ({ ...prev, database: !categoriesError }))
        
        if (!categoriesError) {
          console.log('✅ Database tables accessible!')
          setDetails({ categories: categories?.length || 0 })
        } else {
          console.error('❌ Database error:', categoriesError)
        }

        // Test Cloudinary (basic check)
        const cloudinaryConfigured = !!(
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
          import.meta.env.VITE_CLOUDINARY_API_KEY &&
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        )
        setStatus(prev => ({ ...prev, cloudinary: cloudinaryConfigured }))
        
        if (cloudinaryConfigured) {
          console.log('✅ Cloudinary configuration found!')
        } else {
          console.log('❌ Cloudinary configuration missing!')
        }

      } else {
        console.error('❌ Supabase connection failed:', supabaseTest.error)
      }
    } catch (error) {
      console.error('❌ Connection test error:', error)
      setStatus({ supabase: false, cloudinary: false, database: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testAllConnections()
  }, [])

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Loader2 className="h-4 w-4 animate-spin" />
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Testing...</Badge>
    return status ? <Badge variant="default" className="bg-green-500">Connected</Badge> : <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          StoryWeaveConnect Connection Test
        </CardTitle>
        <CardDescription>
          Testing connections to Supabase database and Cloudinary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.supabase)}
              {getStatusBadge(status.supabase)}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.database)}
              {getStatusBadge(status.database)}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="text-sm font-medium">Cloudinary</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.cloudinary)}
              {getStatusBadge(status.cloudinary)}
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Environment Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Supabase URL:</span>
              <p className="font-mono text-xs break-all">
                {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Cloudinary Cloud:</span>
              <p className="font-mono text-xs">
                {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not configured'}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        {details && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Connection Details</h4>
            <p className="text-sm text-green-700">
              Found {details.categories} art categories in database
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={testAllConnections} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connections'
            )}
          </Button>
        </div>

        {/* Status Summary */}
        <div className="text-center">
          {status.supabase && status.database && status.cloudinary ? (
            <p className="text-green-600 font-medium">
              🎉 All systems connected! Ready to use StoryWeaveConnect.
            </p>
          ) : status.supabase === false || status.database === false || status.cloudinary === false ? (
            <p className="text-red-600 font-medium">
              ❌ Some connections failed. Check your environment variables.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Testing connections...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
