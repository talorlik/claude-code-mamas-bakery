import { getTranslations } from "next-intl/server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Admin dashboard placeholder. Product and order management land in later
 * batches; for now this confirms the admin guard and shell work.
 */
export default async function AdminDashboardPage() {
  const t = await getTranslations("admin")

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("products")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("comingSoon")}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("orders")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("comingSoon")}
        </CardContent>
      </Card>
    </div>
  )
}
