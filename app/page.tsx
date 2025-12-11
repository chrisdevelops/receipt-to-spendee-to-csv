'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, ReceiptType } from '@/lib/types';
import { Camera, Upload, Download, Trash2 } from 'lucide-react';

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptType, setReceiptType] = useState<ReceiptType>('personal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Partial<Receipt> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);

      // Send image to API for processing
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/extract-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process receipt');
      }

      const extractedData = await response.json();
      
      // Create new receipt with extracted data
      const newReceipt: Partial<Receipt> = {
        id: Date.now().toString(),
        type: receiptType,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        category: extractedData.category || 'Uncategorized',
        amount: extractedData.amount || 0,
        tax: extractedData.tax || 0,
        note: extractedData.note || '',
        imageUrl,
      };

      setCurrentReceipt(newReceipt);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveReceipt = () => {
    if (currentReceipt && currentReceipt.date && currentReceipt.amount) {
      const receipt: Receipt = {
        id: currentReceipt.id || Date.now().toString(),
        type: currentReceipt.type || 'personal',
        date: currentReceipt.date,
        category: currentReceipt.category || 'Uncategorized',
        amount: currentReceipt.amount,
        tax: currentReceipt.tax || 0,
        note: currentReceipt.note || '',
        rawText: currentReceipt.rawText,
        imageUrl: currentReceipt.imageUrl,
      };
      
      setReceipts([...receipts, receipt]);
      setIsDialogOpen(false);
      setCurrentReceipt(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const exportToCSV = (type: ReceiptType) => {
    const filteredReceipts = receipts.filter(r => r.type === type);
    
    if (filteredReceipts.length === 0) {
      alert(`No ${type} receipts to export.`);
      return;
    }

    // Spendee CSV format: Date,Category name,Amount,Type,Note
    const headers = ['Date', 'Category name', 'Amount', 'Type', 'Note', 'Tax'];
    const rows = filteredReceipts.map(receipt => [
      receipt.date,
      receipt.category,
      receipt.amount.toFixed(2),
      'expense',
      receipt.note,
      receipt.tax.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendee-${type}-receipts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReceipts = receipts.filter(r => r.type === receiptType);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Receipt to Spendee CSV</h1>
        
        <div className="mb-6">
          <Tabs value={receiptType} onValueChange={(v) => setReceiptType(v as ReceiptType)}>
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            onClick={handleCameraClick} 
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Take Photo'}
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
          {receipts.length > 0 && (
            <Button 
              onClick={() => exportToCSV(receiptType)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export {receiptType === 'business' ? 'Business' : 'Personal'} CSV
            </Button>
          )}
        </div>

        {filteredReceipts.length > 0 ? (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.date}</TableCell>
                    <TableCell>{receipt.category}</TableCell>
                    <TableCell>${receipt.amount.toFixed(2)}</TableCell>
                    <TableCell>${receipt.tax.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{receipt.note}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
            No receipts added yet. Take a photo or upload an image to get started.
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Receipt Details</DialogTitle>
              <DialogDescription>
                Review and edit the extracted receipt information before adding it to your batch.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentReceipt?.date || ''}
                  onChange={(e) => setCurrentReceipt({ ...currentReceipt, date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={currentReceipt?.category || ''}
                  onChange={(e) => setCurrentReceipt({ ...currentReceipt, category: e.target.value })}
                  placeholder="e.g., Food & Dining"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={currentReceipt?.amount || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={currentReceipt?.tax || ''}
                    onChange={(e) => setCurrentReceipt({ ...currentReceipt, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={currentReceipt?.note || ''}
                  onChange={(e) => setCurrentReceipt({ ...currentReceipt, note: e.target.value })}
                  placeholder="Transaction description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveReceipt}>
                Add to Batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
