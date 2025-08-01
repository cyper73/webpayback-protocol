import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, Shield } from "lucide-react";

const USDTWPTPoolAnalysis = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Pool USDT/WPT - Soluzione Out of Range
          </CardTitle>
          <CardDescription>
            Elimina il problema "Fuori dai limiti" con una pool stabile e redditizia
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current WMATIC/WPT Pool */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <TrendingDown className="h-4 w-4" />
              Pool Attuale (WMATIC/WPT)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>TVL Attuale</span>
              <Badge variant="destructive">€219</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Stato</span>
              <Badge variant="destructive">Fuori dai limiti</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Volatilità</span>
              <Badge variant="destructive">Entrambi token</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tempo attivo</span>
              <Badge variant="destructive">~30%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Manutenzione</span>
              <Badge variant="destructive">Alta</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Proposed USDT/WPT Pool */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <TrendingUp className="h-4 w-4" />
              Pool Proposta (USDT/WPT)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>USDT Address</span>
              <Badge variant="secondary" className="text-xs">0xc213...8e8F</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Stabilità</span>
              <Badge className="bg-green-600">USDT @ $1.00</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Volatilità</span>
              <Badge className="bg-green-600">Solo WPT</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tempo attivo</span>
              <Badge className="bg-green-600">~85%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Manutenzione</span>
              <Badge className="bg-green-600">Bassa</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Range Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategia Range Ottimale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Conservativo</h4>
              <p className="text-sm text-muted-foreground">$0.005 - $0.05</p>
              <Badge variant="outline">10x crescita</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200">
              <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">Bilanciato ⭐</h4>
              <p className="text-sm text-muted-foreground">$0.008 - $0.03</p>
              <Badge className="bg-green-600">3.75x crescita</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <h4 className="font-semibold">Aggressivo</h4>
              <p className="text-sm text-muted-foreground">$0.010 - $0.02</p>
              <Badge variant="outline">2x crescita</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Benefici Attesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">+300%</div>
              <div className="text-sm text-muted-foreground">Tempo in range</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+250%</div>
              <div className="text-sm text-muted-foreground">Commissioni annuali</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">-80%</div>
              <div className="text-sm text-muted-foreground">Interventi manuali</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0.30%</div>
              <div className="text-sm text-muted-foreground">Fee tier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Guida Implementazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-semibold">Acquista USDT su Polygon</h4>
                <p className="text-sm text-muted-foreground">Address: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-semibold">Vai su Uniswap V3</h4>
                <p className="text-sm text-muted-foreground">app.uniswap.org → Pool → New Position</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-semibold">Imposta Range</h4>
                <p className="text-sm text-muted-foreground">Min: $0.008, Max: $0.030 per WPT</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-bold">✓</div>
              <div>
                <h4 className="font-semibold">Goditi liquidità stabile</h4>
                <p className="text-sm text-muted-foreground">Meno manutenzione, più profitti</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Addresses */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Indirizzi Token Verificati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">USDT (Polygon):</span>
            <code className="bg-background px-2 py-1 rounded text-xs">0xc2132D05D31c914a87C6611C10748AEb04B58e8F</code>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">WPT Token:</span>
            <code className="bg-background px-2 py-1 rounded text-xs">0x9408f17a8B4666f8cb8231BA213DE04137dc3825</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default USDTWPTPoolAnalysis;