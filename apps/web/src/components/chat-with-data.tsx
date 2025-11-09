'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api, ChatResponse } from '@/lib/api';
import { ChatVisualization } from './chat-visualization';

export function ChatWithData() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.chatWithData(query);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Card>
        <CardHeader>
          <CardTitle>Chat with Data</CardTitle>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Ask questions about your data in natural language. For example:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;What&apos;s the total spend in the last 90 days?&quot;</li>
              <li>&quot;List top 5 vendors by spend.&quot;</li>
              <li>&quot;Show overdue invoices as of today.&quot;</li>
            </ul>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your data..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? 'Processing...' : 'Ask'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {response && (
        <div className="space-y-4">
          {/* Debug: Log response for troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              Debug: hasChart={response.chart ? 'yes' : 'no'}, 
              chartType={response.chart?.type || 'none'}, 
              dataLength={response.data?.length || 0}
            </div>
          )}
          
          {/* SQL Query */}
          {response.sql && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Generated SQL</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(response.sql || '');
                    }}
                    className="ml-auto"
                  >
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {response.sql}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Visualization */}
          {response.chart && response.data && response.data.length > 0 && (
            <ChatVisualization data={response.data} chart={response.chart} />
          )}

          {/* Summary Statistics */}
          {response.data && response.data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Rows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{response.data.length}</div>
                </CardContent>
              </Card>
              {(() => {
                const numericColumns = Object.keys(response.data[0]).filter(
                  (key) => typeof response.data[0][key] === 'number'
                );
                if (numericColumns.length > 0) {
                  const firstNumeric = numericColumns[0];
                  const sum = response.data.reduce(
                    (acc, row) => acc + (Number(row[firstNumeric]) || 0),
                    0
                  );
                  const avg = sum / response.data.length;
                  return (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Total ({firstNumeric})</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(sum).replace('EUR', '€')}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Average ({firstNumeric})</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(avg).replace('EUR', '€')}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Data Table */}
          {response.data && response.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Results</CardTitle>
                <CardDescription>{response.data.length} row(s) returned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto overflow-y-auto" style={{ maxHeight: '600px', maxWidth: '100%' }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        {Object.keys(response.data[0]).map((key) => (
                          <TableHead key={key} className="font-semibold">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {response.data.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          {Object.entries(row).map(([key, value], cellIdx) => (
                            <TableCell key={cellIdx} className="font-medium">
                              {(() => {
                                if (value === null || value === undefined) {
                                  return <span className="text-muted-foreground">—</span>;
                                }
                                if (typeof value === 'number') {
                                  // Check if it looks like currency (has decimal places or is large)
                                  if (key.toLowerCase().includes('amount') || 
                                      key.toLowerCase().includes('total') ||
                                      key.toLowerCase().includes('spend') ||
                                      key.toLowerCase().includes('value') ||
                                      key.toLowerCase().includes('cost') ||
                                      key.toLowerCase().includes('price')) {
                                    return new Intl.NumberFormat('de-DE', {
                                      style: 'currency',
                                      currency: 'EUR',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(value).replace('EUR', '€');
                                  }
                                  return new Intl.NumberFormat('de-DE').format(value);
                                }
                                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                                  // Format dates
                                  try {
                                    const date = new Date(value);
                                    return new Intl.DateTimeFormat('de-DE', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    }).format(date);
                                  } catch {
                                    return value;
                                  }
                                }
                                if (typeof value === 'object') {
                                  return <span className="text-muted-foreground text-xs">{JSON.stringify(value)}</span>;
                                }
                                return String(value);
                              })()}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {response.data && response.data.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-lg">No results found.</p>
                  <p className="text-sm mt-2">Try rephrasing your question or check the SQL query above.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

