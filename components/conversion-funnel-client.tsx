"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FunnelData {
  stage: string
  count: number
  percentage: number
}

interface ConversionFunnelClientProps {
  data: FunnelData[]
}

export function ConversionFunnelClient({ data }: ConversionFunnelClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.stage}</span>
              <span className="text-sm text-muted-foreground">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
