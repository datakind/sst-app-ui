import plotlyMod from 'plotly.js';
import factoryMod from 'react-plotly.js/factory';

const Plotly = plotlyMod?.default ?? plotlyMod;
const createPlotlyComponent = factoryMod?.default ?? factoryMod;

export default createPlotlyComponent(Plotly);
