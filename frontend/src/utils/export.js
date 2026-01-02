import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const generateGraphDataURI = (projections, type) => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  if (!projections || projections.length === 0) return null;
  
  const years = projections.map(p => p.year);
  let data = [];
  let color = '#00FF6F';
  let label = '';
  
  if (type === 'revenue') {
    data = projections.map(p => p.cumulative_revenue_million || 0);
    label = 'Cumulative Revenue (Million USD)';
  } else if (type === 'co2') {
    data = projections.map(p => p.co2_reduced_cumulative_mt || 0);
    color = '#60a5fa';
    label = 'Cumulative CO2 Reduced (Million tonnes)';
  } else if (type === 'risk') {
    data = projections.map(p => p.abolishment_risk_percent || 0);
    color = '#fbbf24';
    label = 'Abolishment Risk (%)';
  }
  
  const padding = 60;
  const chartWidth = canvas.width - (padding * 2);
  const chartHeight = canvas.height - (padding * 2);
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight * (1 - i / 5));
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
    
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText((minValue + (range * i / 5)).toFixed(1), padding - 10, y + 4);
  }
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.fillStyle = color;
  ctx.beginPath();
  
  for (let i = 0; i < years.length; i++) {
    const x = padding + (chartWidth * i / (years.length - 1 || 1));
    const y = padding + chartHeight - (chartHeight * ((data[i] - minValue) / range));
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    ctx.fillRect(x - 4, y - 4, 8, 8);
  }
  
  ctx.stroke();
  
  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, canvas.width / 2, 30);
  
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  for (let i = 0; i < years.length; i += Math.max(1, Math.floor(years.length / 6))) {
    const x = padding + (chartWidth * i / (years.length - 1 || 1));
    ctx.fillText(years[i].toString(), x, canvas.height - padding + 20);
  }
  
  return canvas.toDataURL('image/png');
};

export const exportToCSV = (simulation) => {
  const rows = [];
  
  rows.push(['Simulation Details', '']);
  rows.push(['Policy Name', simulation.policy_name || 'N/A']);
  rows.push(['Country', simulation.input_params?.country || 'N/A']);
  rows.push(['Policy Type', simulation.input_params?.policy_type || 'N/A']);
  rows.push(['Carbon Price (USD/tonne)', simulation.input_params?.carbon_price_usd || 'N/A']);
  rows.push(['Coverage (%)', simulation.input_params?.coverage_percent || 'N/A']);
  rows.push(['Year', simulation.input_params?.year || 'N/A']);
  rows.push(['Projection Years', simulation.input_params?.projection_years || 'N/A']);
  rows.push(['Created At', new Date(simulation.created_at).toLocaleString()]);
  rows.push(['', '']);
  
  rows.push(['Prediction Results', '']);
  const results = simulation.results;
  rows.push(['Revenue (Million USD)', results.revenue_million || 0]);
  rows.push(['Risk Adjusted Value (Million USD)', results.risk_adjusted_value_million || 0]);
  rows.push(['Abolishment Risk (%)', results.abolishment_risk_percent || 0]);
  rows.push(['Risk Category', results.risk_category || 'N/A']);
  rows.push(['Total Country CO2 (Million tonnes)', results.total_country_co2_mt || 0]);
  rows.push(['CO2 Covered (Million tonnes)', results.co2_covered_mt || 0]);
  rows.push(['CO2 Reduced (Million tonnes)', results.co2_reduced_mt || 0]);
  rows.push(['CO2 Covered Per Capita (tonnes)', results.co2_covered_per_capita_tonnes || 0]);
  rows.push(['', '']);
  
  rows.push(['Environmental Equivalencies', '']);
  rows.push(['Cars Off Road (1 year)', results.cars_off_road_equivalent || 0]);
  rows.push(['Trees Planted (1 year)', results.trees_planted_equivalent || 0]);
  rows.push(['Coal Plants Closed (1GW)', results.coal_plants_closed_equivalent || 0]);
  rows.push(['Homes Powered Clean (1 year)', results.homes_powered_equivalent || 0]);
  rows.push(['', '']);
  
  rows.push(['Recommendations', '']);
  rows.push(['Recommendation', results.recommendation || 'N/A']);
  rows.push(['Context Explanation', results.context_explanation || 'N/A']);
  rows.push(['', '']);
  
  rows.push(['Similar Policies', '']);
  if (results.similar_policies && Array.isArray(results.similar_policies)) {
    results.similar_policies.forEach((policy, index) => {
      rows.push([`Policy ${index + 1}`, policy]);
    });
  }
  rows.push(['', '']);
  
  rows.push(['Key Risks', '']);
  if (results.key_risks && Array.isArray(results.key_risks)) {
    results.key_risks.forEach((risk, index) => {
      rows.push([`Risk ${index + 1}`, risk]);
    });
  }
  rows.push(['', '']);
  
  rows.push(['Year-by-Year Projections', '']);
  rows.push(['Year', 'Revenue (Million USD)', 'CO2 Reduced (MT)', 'Cumulative CO2 Reduced (MT)', 'Abolishment Risk (%)', 'Risk Category', 'Risk Adjusted Value (Million USD)']);
  if (results.projections && Array.isArray(results.projections)) {
    results.projections.forEach((proj) => {
      rows.push([
        proj.year || '',
        proj.revenue_million || 0,
        proj.co2_reduced_mt || 0,
        proj.co2_reduced_cumulative_mt || 0,
        proj.abolishment_risk_percent || 0,
        proj.risk_category || '',
        proj.risk_adjusted_value_million || 0
      ]);
    });
  }
  
  const csvContent = rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${(simulation.policy_name || 'simulation').replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (simulation, elementRef = null) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const results = simulation.results;
    const inputParams = simulation.input_params || {};
    
    if (!results) {
      console.error('No results data found in simulation');
      throw new Error('No simulation results found. Please ensure the simulation has completed successfully.');
    }
    
    let yPos = 20;
  
  doc.setFillColor(0, 255, 111);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(10, 13, 11);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(simulation.policy_name || 'Climate Policy Simulation Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
  
  yPos = 40;
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 214, 223);
  doc.text('Policy Parameters', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const params = [
    ['Country', String(inputParams.country || 'N/A')],
    ['Policy Type', String(inputParams.policy_type || 'N/A')],
    ['Carbon Price', `$${inputParams.carbon_price_usd || 0}/tonne`],
    ['Coverage', `${inputParams.coverage_percent || 0}%`],
    ['Year', String(inputParams.year || 'N/A')],
    ['Projection Period', `${inputParams.projection_years || 0} years`]
  ];
  
  params.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 60, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 214, 223);
  doc.text('Financial Predictions', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const financialData = [
    ['Predicted Revenue', `$${results.revenue_million?.toFixed(2) || 0}M`],
    ['Risk Adjusted Value', `$${results.risk_adjusted_value_million?.toFixed(2) || 0}M`],
    ['Abolishment Risk', `${results.abolishment_risk_percent?.toFixed(1) || 0}%`],
    ['Risk Category', results.risk_category || 'N/A']
  ];
  
  financialData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 70, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  if (results.projections && results.projections.length > 0) {
    const revenueGraph = generateGraphDataURI(results.projections, 'revenue');
    if (revenueGraph) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 214, 223);
      doc.text('Revenue Trend', 105, yPos, { align: 'center' });
      yPos += 10;
      
      doc.addImage(revenueGraph, 'PNG', 20, yPos, 170, 85);
      yPos += 95;
    }
  }
  
  if (results.projections && results.projections.length > 0) {
    const co2Graph = generateGraphDataURI(results.projections, 'co2');
    if (co2Graph) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 214, 223);
      doc.text('CO2 Reduction Trend', 105, yPos, { align: 'center' });
      yPos += 10;
      
      doc.addImage(co2Graph, 'PNG', 20, yPos, 170, 85);
      yPos += 95;
    }
  }
  
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 214, 223);
  doc.text('Environmental Impact', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const envData = [
    ['Total Country CO2', `${results.total_country_co2_mt?.toFixed(2) || 0} Million tonnes`],
    ['CO2 Covered', `${results.co2_covered_mt?.toFixed(2) || 0} Million tonnes`],
    ['Potential CO2 Reduction', `${results.co2_reduced_mt?.toFixed(2) || 0} Million tonnes`],
    ['CO2 Covered Per Capita', `${results.co2_covered_per_capita_tonnes?.toFixed(2) || 0} tonnes`]
  ];
  
  envData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 75, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 214, 223);
  doc.text('Environmental Equivalencies', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const equivalencies = [
    ['Cars Off Road (1 year)', results.cars_off_road_equivalent?.toLocaleString() || '0'],
    ['Trees Planted (1 year)', results.trees_planted_equivalent?.toLocaleString() || '0'],
    ['Coal Plants Closed (1GW)', results.coal_plants_closed_equivalent?.toFixed(2) || '0'],
    ['Homes Powered Clean (1 year)', results.homes_powered_equivalent?.toLocaleString() || '0']
  ];
  
  equivalencies.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 80, yPos);
    yPos += 7;
  });
  
  if (results.projections && results.projections.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 214, 223);
    doc.text('Year-by-Year Projections', 105, yPos, { align: 'center' });
    yPos += 10;
    
    const tableData = [
      ['Year', 'Revenue ($M)', 'CO2 Reduced (MT)', 'Risk (%)', 'Category']
    ];
    
    results.projections.slice(0, 15).forEach(proj => {
      tableData.push([
        proj.year?.toString() || '',
        proj.revenue_million?.toFixed(2) || '0',
        proj.co2_reduced_mt?.toFixed(2) || '0',
        proj.abolishment_risk_percent?.toFixed(1) || '0',
        proj.risk_category || ''
      ]);
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [0, 255, 111], textColor: [10, 13, 11], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 }
    });
  }
  
    if (results.recommendation || results.context_explanation) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 214, 223);
      doc.text('Recommendations & Analysis', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (results.recommendation) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const recommendationLines = doc.splitTextToSize(results.recommendation, 180);
        doc.text(recommendationLines, 14, yPos);
        yPos += recommendationLines.length * 6 + 5;
      }
      
      if (results.context_explanation) {
        doc.setFont('helvetica', 'bold');
        doc.text('Context Explanation:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const contextLines = doc.splitTextToSize(results.context_explanation, 180);
        doc.text(contextLines, 14, yPos);
        yPos += contextLines.length * 6;
      }
    }
    
    const fileName = `${(simulation.policy_name || 'simulation').replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(error.message || 'Failed to generate PDF. Please try again.');
  }
};

export const exportComparisonToCSV = (sim1, sim2) => {
  const rows = [];
  
  rows.push(['Policy Comparison Report', '']);
  rows.push(['Generated', new Date().toLocaleString()]);
  rows.push(['', '']);
  
  rows.push(['=== POLICY 1 ===', '']);
  rows.push(['Policy Name', sim1.policy_name || 'Policy 1']);
  rows.push(['Country', sim1.input_params?.country || 'N/A']);
  rows.push(['Policy Type', sim1.input_params?.policy_type || 'N/A']);
  rows.push(['Carbon Price (USD/tonne)', sim1.input_params?.carbon_price_usd || 'N/A']);
  rows.push(['Coverage (%)', sim1.input_params?.coverage_percent || 'N/A']);
  rows.push(['Revenue (Million USD)', sim1.results.revenue_million || 0]);
  rows.push(['Risk Adjusted Value (Million USD)', sim1.results.risk_adjusted_value_million || 0]);
  rows.push(['Abolishment Risk (%)', sim1.results.abolishment_risk_percent || 0]);
  rows.push(['Risk Category', sim1.results.risk_category || 'N/A']);
  rows.push(['CO2 Reduced (Million tonnes)', sim1.results.co2_reduced_mt || 0]);
  rows.push(['', '']);
  
  rows.push(['=== POLICY 2 ===', '']);
  rows.push(['Policy Name', sim2.policy_name || 'Policy 2']);
  rows.push(['Country', sim2.input_params?.country || 'N/A']);
  rows.push(['Policy Type', sim2.input_params?.policy_type || 'N/A']);
  rows.push(['Carbon Price (USD/tonne)', sim2.input_params?.carbon_price_usd || 'N/A']);
  rows.push(['Coverage (%)', sim2.input_params?.coverage_percent || 'N/A']);
  rows.push(['Revenue (Million USD)', sim2.results.revenue_million || 0]);
  rows.push(['Risk Adjusted Value (Million USD)', sim2.results.risk_adjusted_value_million || 0]);
  rows.push(['Abolishment Risk (%)', sim2.results.abolishment_risk_percent || 0]);
  rows.push(['Risk Category', sim2.results.risk_category || 'N/A']);
  rows.push(['CO2 Reduced (Million tonnes)', sim2.results.co2_reduced_mt || 0]);
  rows.push(['', '']);
  
  rows.push(['=== COMPARISON ===', '']);
  rows.push(['Metric', 'Policy 1', 'Policy 2', 'Difference']);
  rows.push(['Revenue (Million USD)', sim1.results.revenue_million || 0, sim2.results.revenue_million || 0, ((sim1.results.revenue_million || 0) - (sim2.results.revenue_million || 0)).toFixed(2)]);
  rows.push(['Risk Adjusted Value (Million USD)', sim1.results.risk_adjusted_value_million || 0, sim2.results.risk_adjusted_value_million || 0, ((sim1.results.risk_adjusted_value_million || 0) - (sim2.results.risk_adjusted_value_million || 0)).toFixed(2)]);
  rows.push(['Abolishment Risk (%)', sim1.results.abolishment_risk_percent || 0, sim2.results.abolishment_risk_percent || 0, ((sim1.results.abolishment_risk_percent || 0) - (sim2.results.abolishment_risk_percent || 0)).toFixed(1)]);
  rows.push(['CO2 Reduced (Million tonnes)', sim1.results.co2_reduced_mt || 0, sim2.results.co2_reduced_mt || 0, ((sim1.results.co2_reduced_mt || 0) - (sim2.results.co2_reduced_mt || 0)).toFixed(2)]);
  
  const csvContent = rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `comparison_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportComparisonToPDF = async (sim1, sim2) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    if (!sim1 || !sim2 || !sim1.results || !sim2.results) {
      console.error('Invalid simulation data for comparison');
      throw new Error('Invalid simulation data. Please ensure both simulations have valid results.');
    }
    
    doc.setFillColor(0, 255, 111);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(10, 13, 11);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Comparison Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
    
    let yPos = 40;
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 214, 223);
    doc.text('Policy 1', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const sim1Data = [
      ['Name', sim1.policy_name || 'Policy 1'],
      ['Country', sim1.input_params?.country || 'N/A'],
      ['Type', sim1.input_params?.policy_type || 'N/A'],
      ['Carbon Price', `$${sim1.input_params?.carbon_price_usd || 0}/tonne`],
      ['Coverage', `${sim1.input_params?.coverage_percent || 0}%`],
      ['Revenue', `$${sim1.results.revenue_million?.toFixed(2) || 0}M`],
      ['Risk Adjusted Value', `$${sim1.results.risk_adjusted_value_million?.toFixed(2) || 0}M`],
      ['Risk Category', sim1.results.risk_category || 'N/A'],
      ['CO2 Reduced', `${sim1.results.co2_reduced_mt?.toFixed(2) || 0}M tonnes`]
    ];
    
    sim1Data.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, yPos);
      yPos += 7;
    });
    
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 214, 223);
    doc.text('Policy 2', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const sim2Data = [
      ['Name', sim2.policy_name || 'Policy 2'],
      ['Country', sim2.input_params?.country || 'N/A'],
      ['Type', sim2.input_params?.policy_type || 'N/A'],
      ['Carbon Price', `$${sim2.input_params?.carbon_price_usd || 0}/tonne`],
      ['Coverage', `${sim2.input_params?.coverage_percent || 0}%`],
      ['Revenue', `$${sim2.results.revenue_million?.toFixed(2) || 0}M`],
      ['Risk Adjusted Value', `$${sim2.results.risk_adjusted_value_million?.toFixed(2) || 0}M`],
      ['Risk Category', sim2.results.risk_category || 'N/A'],
      ['CO2 Reduced', `${sim2.results.co2_reduced_mt?.toFixed(2) || 0}M tonnes`]
    ];
    
    sim2Data.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, yPos);
      yPos += 7;
    });
    
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 214, 223);
    doc.text('Side-by-Side Comparison', 105, yPos, { align: 'center' });
    yPos += 10;
    
    const comparisonData = [
      ['Metric', 'Policy 1', 'Policy 2', 'Difference'],
      ['Revenue ($M)', `$${sim1.results.revenue_million?.toFixed(2) || 0}`, `$${sim2.results.revenue_million?.toFixed(2) || 0}`, `$${((sim1.results.revenue_million || 0) - (sim2.results.revenue_million || 0)).toFixed(2)}`],
      ['Risk Adj. Value ($M)', `$${sim1.results.risk_adjusted_value_million?.toFixed(2) || 0}`, `$${sim2.results.risk_adjusted_value_million?.toFixed(2) || 0}`, `$${((sim1.results.risk_adjusted_value_million || 0) - (sim2.results.risk_adjusted_value_million || 0)).toFixed(2)}`],
      ['Abolishment Risk (%)', `${sim1.results.abolishment_risk_percent?.toFixed(1) || 0}%`, `${sim2.results.abolishment_risk_percent?.toFixed(1) || 0}%`, `${((sim1.results.abolishment_risk_percent || 0) - (sim2.results.abolishment_risk_percent || 0)).toFixed(1)}%`],
      ['CO2 Reduced (M tonnes)', `${sim1.results.co2_reduced_mt?.toFixed(2) || 0}`, `${sim2.results.co2_reduced_mt?.toFixed(2) || 0}`, `${((sim1.results.co2_reduced_mt || 0) - (sim2.results.co2_reduced_mt || 0)).toFixed(2)}`]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [0, 255, 111], textColor: [10, 13, 11], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 }
    });
    
    const fileName = `comparison_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating comparison PDF:', error);
    throw new Error(error.message || 'Failed to generate comparison PDF. Please try again.');
  }
};
