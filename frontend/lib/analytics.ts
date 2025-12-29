export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Page view
export const pageview = (url: string) => {
    if (typeof window.gtag !== "undefined") {
        window.gtag("config", GA_ID!, {
            page_path: url,
        })
    }
}

// Custom events
export const event = (action: string, params?: Record<string, any>) => {
    if (typeof window.gtag !== "undefined") {
        window.gtag("event", action, params)
    }
}

// Pre-defined events
export const trackUpload = () => event("upload_started")
export const trackUploadSuccess = () => event("upload_success")
export const trackUploadError = (error: string) => event("upload_error", { error })

// Interaction events
export const trackDownload = () => event("download_clicked")
export const trackTryAgain = () => event("try_again_clicked")
export const trackProcessAnother = () => event("process_another_clicked")

// Pricing events
export const trackPricingView = () => event("pricing_viewed")
export const trackSelectPlan = (plan: string) => event("select_plan", { plan_name: plan })

// Auth events
export const trackLoginSubmit = () => event("login_submit")
export const trackMagicLinkSent = () => event("magic_link_sent")
export const trackLoginError = (error: string) => event("login_error", { error })
