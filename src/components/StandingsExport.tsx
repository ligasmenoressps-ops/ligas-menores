'use client';

import React, { useState } from 'react';
import { StandingsRow } from '@/lib/standings';
import { FileDown, Image as ImageIcon, FileText, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

type Props = {
  standings: StandingsRow[];
  tournamentName: string;
};

export function StandingsExport({ standings, tournamentName }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const getFormattedDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const exportExcel = () => {
    const data = standings.map(row => ({
      Posición: row.position,
      Equipo: row.teamName,
      'Partidos Jugados': row.played,
      'Ganados': row.won,
      'Empatados': row.drawn,
      'Perdidos': row.lost,
      'Goles a Favor': row.goalsFor,
      'Goles en Contra': row.goalsAgainst,
      'Diferencia de Goles': row.goalDifference,
      'Puntos': row.points,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Posiciones");
    XLSX.writeFile(wb, `Posiciones_${tournamentName.replace(/ /g, '_')}_${getFormattedDate()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Tabla de Posiciones: ${tournamentName}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);

    const tableColumn = ["Pos", "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DG", "PTS"];
    const tableRows = standings.map(row => [
      row.position,
      row.teamName,
      row.played,
      row.won,
      row.drawn,
      row.lost,
      row.goalsFor,
      row.goalsAgainst,
      row.goalDifference,
      row.points
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Posiciones_${tournamentName.replace(/ /g, '_')}_${getFormattedDate()}.pdf`);
  };

  const exportJPG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('standings-table-container');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `Posiciones_${tournamentName.replace(/ /g, '_')}_${getFormattedDate()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exportando a JPG', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportWord = () => {
    const tableElement = document.getElementById('standings-table-container');
    if (!tableElement) return;

    // Clonar para limpiar botones o iconos si es necesario, pero en este caso el HTML básico está bien
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Tabla de Posiciones</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
          th, td { border: 1px solid #dddddd; padding: 8px; text-align: center; }
          th { background-color: #1e293b; color: white; }
          td:nth-child(2) { text-align: left; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Tabla de Posiciones: ${tournamentName}</h2>
        ${tableElement.outerHTML}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Posiciones_${tournamentName.replace(/ /g, '_')}_${getFormattedDate()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button 
        onClick={exportExcel} 
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
      >
        <Table size={16} /> Excel
      </button>
      
      <button 
        onClick={exportPDF} 
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
      >
        <FileDown size={16} /> PDF
      </button>
      
      <button 
        onClick={exportJPG} 
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ImageIcon size={16} /> JPG
      </button>
      
      <button 
        onClick={exportWord} 
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white border border-blue-700 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FileText size={16} /> Word
      </button>
    </div>
  );
}
