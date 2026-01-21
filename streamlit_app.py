"""
Macro Impact Tracker - Streamlit Application

A real-time dashboard that monitors and analyzes how major economic 
data releases impact prices across equities, forex, bonds, commodities, 
crypto, and volatility indices.

Uses LIVE prices from Yahoo Finance and CoinGecko APIs.
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
import time

from services import MarketDataService, MacroDataService, EventScheduler, ImpactAnalyzer

# Page configuration
st.set_page_config(
    page_title="Macro Impact Tracker",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inject custom CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    .stApp {
        background-color: #f8fafc;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    [data-testid="collapsedControl"] {display: none;}
    
    .card {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        padding: 1.5rem;
    }
    
    .card-bordered {
        border-left: 4px solid #8b5cf6;
    }
    
    .chart-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        display: block;
        margin-bottom: 0.25rem;
    }
    
    .chart-price {
        font-size: 2.5rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 300;
        color: #0f172a;
    }
    
    .chart-change-positive {
        font-size: 1.125rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        margin-left: 1rem;
        color: #059669;
    }
    
    .chart-change-negative {
        font-size: 1.125rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        margin-left: 1rem;
        color: #e11d48;
    }
    
    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .section-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1rem;
        background: linear-gradient(135deg, #7c3aed, #8b5cf6);
    }
    
    .section-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #0f172a;
    }
    
    .event-item {
        padding: 0.875rem;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 3px solid #8b5cf6;
        margin-bottom: 0.5rem;
    }
    
    .event-critical {
        border-left-color: #f43f5e;
        background: #fff1f2;
    }
    
    .event-high {
        border-left-color: #f59e0b;
        background: #fffbeb;
    }
    
    .event-indicator {
        font-size: 0.75rem;
        font-weight: 600;
        color: #94a3b8;
    }
    
    .event-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #0f172a;
        margin: 0.25rem 0;
    }
    
    .event-meta {
        font-size: 0.75rem;
        color: #64748b;
    }
    
    div[data-testid="stMetricValue"] {
        font-family: 'JetBrains Mono', monospace;
    }
    
    .stButton > button {
        border-radius: 8px;
    }
    
    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.25rem;
    }
    
    .page-subtitle {
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 1.5rem;
    }
    
    .live-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: #dcfce7;
        color: #166534;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

# Asset groups
ASSET_GROUPS = {
    'Equities': ['SPY', 'QQQ', 'IWM', 'DIA'],
    'FX': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'DXY'],
    'Bonds': ['TLT', 'IEF', 'HYG'],
    'Volatility': ['VIX', 'VVIX'],
    'Commodities': ['GLD', 'USO'],
    'Crypto': ['BTC', 'ETH', 'SOL', 'XRP']
}

# Initialize services (cached globally)
@st.cache_resource
def init_services():
    market_service = MarketDataService()
    macro_service = MacroDataService()
    event_scheduler = EventScheduler()
    impact_analyzer = ImpactAnalyzer()
    market_service.start_simulation()
    return market_service, macro_service, event_scheduler, impact_analyzer

market_service, macro_service, event_scheduler, impact_analyzer = init_services()

# Session state
if 'selected_asset' not in st.session_state:
    st.session_state.selected_asset = 'SPY'
if 'selected_group' not in st.session_state:
    st.session_state.selected_group = 'Equities'
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'Dashboard'


def get_live_prices():
    """Get the current snapshot of all live prices - single source of truth."""
    return market_service.get_snapshot()


def render_header():
    """Render the header with functional navigation."""
    col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])
    
    with col1:
        st.markdown("### 📊 Macro Impact Tracker")
    
    with col2:
        if st.button("📋 Dashboard", use_container_width=True, 
                     type="primary" if st.session_state.current_page == "Dashboard" else "secondary"):
            st.session_state.current_page = "Dashboard"
            st.rerun()
    
    with col3:
        if st.button("📈 Analysis", use_container_width=True,
                     type="primary" if st.session_state.current_page == "Analysis" else "secondary"):
            st.session_state.current_page = "Analysis"
            st.rerun()
    
    with col4:
        if st.button("📅 Calendar", use_container_width=True,
                     type="primary" if st.session_state.current_page == "Calendar" else "secondary"):
            st.session_state.current_page = "Calendar"
            st.rerun()
    
    with col5:
        st.markdown('<span class="live-badge">🔴 LIVE</span>', unsafe_allow_html=True)


def render_ticker(snapshot):
    """Render the market ticker bar using the shared price snapshot."""
    ticker_symbols = ['SPY', 'QQQ', 'BTC', 'ETH', 'EUR/USD', 'VIX', 'GLD']
    
    cols = st.columns(len(ticker_symbols))
    for i, symbol in enumerate(ticker_symbols):
        data = snapshot.get(symbol)
        if data and data.get('price', 0) > 0:
            change = data.get('change_percent', 0)
            decimals = 4 if '/' in symbol or symbol == 'XRP' else 2
            with cols[i]:
                st.metric(
                    label=symbol,
                    value=f"{data['price']:,.{decimals}f}",
                    delta=f"{change:+.2f}%"
                )
        else:
            with cols[i]:
                st.metric(label=symbol, value="Loading...", delta="")


def render_dashboard(snapshot):
    """Render the main dashboard using the shared price snapshot."""
    col1, col2 = st.columns([2, 1], gap="large")
    
    with col1:
        selected = st.session_state.selected_asset
        data = snapshot.get(selected, {})
        
        price = data.get('price', 0)
        if price > 0:
            decimals = 4 if '/' in selected or selected == 'XRP' else 2
            change = data.get('change_percent', 0)
            change_class = 'chart-change-positive' if change >= 0 else 'chart-change-negative'
            
            st.markdown(f"""
            <div class="card card-bordered">
                <span class="chart-label">{data.get('name', selected)} <span class="live-badge">🔴 LIVE</span></span>
                <div style="display: flex; align-items: baseline;">
                    <span class="chart-price">${price:,.{decimals}f}</span>
                    <span class="{change_class}">{'+' if change >= 0 else ''}{change:.2f}%</span>
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.info(f"Loading price for {selected}...")
        
        # Price chart
        history = market_service.get_history(selected, points=100)
        if history:
            df = pd.DataFrame(history)
            df['time'] = pd.to_datetime(df['time'], unit='ms')
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=df['time'],
                y=df['price'],
                mode='lines',
                line=dict(color='#8b5cf6', width=2),
                fill='tozeroy',
                fillcolor='rgba(139, 92, 246, 0.1)',
                hovertemplate='$%{y:,.2f}<extra></extra>'
            ))
            
            fig.update_layout(
                height=320,
                margin=dict(l=0, r=0, t=10, b=0),
                xaxis=dict(showgrid=False, showticklabels=True),
                yaxis=dict(showgrid=True, gridcolor='rgba(0,0,0,0.05)', side='right'),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                hovermode='x unified',
                showlegend=False
            )
            
            st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
        else:
            st.info("Waiting for price data...")
        
        st.markdown("---")
        
        # Group selection
        groups = list(ASSET_GROUPS.keys())
        selected_group = st.radio(
            "Asset Group",
            groups,
            horizontal=True,
            index=groups.index(st.session_state.selected_group),
            key="group_selector"
        )
        st.session_state.selected_group = selected_group
        
        # Asset cards grid - using the SAME snapshot
        symbols = ASSET_GROUPS[selected_group]
        cols = st.columns(len(symbols))
        
        for i, symbol in enumerate(symbols):
            asset_data = snapshot.get(symbol, {})
            with cols[i]:
                price = asset_data.get('price', 0)
                change = asset_data.get('change_percent', 0)
                decimals = 4 if '/' in symbol or symbol == 'XRP' else 2
                name = asset_data.get('name', symbol)[:15] if asset_data.get('name') else symbol
                
                is_selected = symbol == st.session_state.selected_asset
                
                if st.button(
                    f"**{symbol}**",
                    key=f"asset_{symbol}",
                    use_container_width=True,
                    type="primary" if is_selected else "secondary"
                ):
                    st.session_state.selected_asset = symbol
                    st.rerun()
                
                if price > 0:
                    st.metric(
                        label=name,
                        value=f"{price:,.{decimals}f}",
                        delta=f"{change:+.2f}%"
                    )
                else:
                    st.metric(label=name, value="--", delta="")
    
    with col2:
        st.markdown("""
        <div class="section-header">
            <div class="section-icon">⚡</div>
            <span class="section-title">Upcoming Events</span>
        </div>
        """, unsafe_allow_html=True)
        
        events = event_scheduler.get_upcoming_events()[:8]
        
        for event in events:
            evt_date = datetime.fromisoformat(event['date'].replace('T', ' '))
            importance = event.get('importance', 'medium')
            importance_class = f"event-{importance}" if importance in ['critical', 'high'] else ''
            
            st.markdown(f"""
            <div class="event-item {importance_class}">
                <div class="event-indicator">{event['indicator']}</div>
                <div class="event-name">{event['name']}</div>
                <div class="event-meta">{evt_date.strftime('%b %d, %Y')} • {evt_date.strftime('%H:%M')} ET</div>
            </div>
            """, unsafe_allow_html=True)


def render_calendar():
    """Render the economic calendar view."""
    st.markdown('<div class="page-title">📅 Economic Calendar</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Track upcoming macro economic data releases</div>', unsafe_allow_html=True)
    
    events = event_scheduler.get_upcoming_events()
    
    if not events:
        st.info("No upcoming events found.")
        return
    
    df = pd.DataFrame(events)
    df['date'] = pd.to_datetime(df['date'])
    df['Date'] = df['date'].dt.strftime('%b %d, %Y')
    df['Time'] = df['date'].dt.strftime('%H:%M')
    
    col1, col2 = st.columns(2)
    with col1:
        indicators = ["All"] + sorted(df['indicator'].unique().tolist())
        indicator_filter = st.selectbox("Filter by Indicator", indicators)
    with col2:
        importance_filter = st.selectbox("Filter by Importance", ["All", "critical", "high", "medium"])
    
    filtered_df = df.copy()
    if indicator_filter != "All":
        filtered_df = filtered_df[filtered_df['indicator'] == indicator_filter]
    if importance_filter != "All":
        filtered_df = filtered_df[filtered_df['importance'] == importance_filter]
    
    display_df = filtered_df[['Date', 'Time', 'indicator', 'name', 'importance', 'forecast', 'previous']].copy()
    display_df.columns = ['Date', 'Time', 'Indicator', 'Event', 'Importance', 'Forecast', 'Previous']
    
    st.dataframe(display_df, use_container_width=True, hide_index=True, height=500)


def render_analysis(snapshot):
    """Render the impact analysis view using the shared price snapshot."""
    st.markdown('<div class="page-title">📈 Impact Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-subtitle">Analyze how macro events affect different asset classes</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.selectbox("Select Indicator", ["All", "CPI", "NFP", "PMI", "FOMC", "GDP", "PCE", "PPI", "RETAIL"])
    with col2:
        st.selectbox("Timeframe", ["1m", "5m", "15m", "30m", "60m"], index=4)
    
    st.markdown("---")
    
    # Show current live prices for reference
    st.markdown("### Current Market Prices (LIVE)")
    
    cols = st.columns(6)
    key_assets = ['SPY', 'EUR/USD', 'TLT', 'VIX', 'GLD', 'BTC']
    for i, symbol in enumerate(key_assets):
        data = snapshot.get(symbol, {})
        with cols[i]:
            price = data.get('price', 0)
            change = data.get('change_percent', 0)
            decimals = 4 if '/' in symbol else 2
            if price > 0:
                st.metric(label=symbol, value=f"{price:,.{decimals}f}", delta=f"{change:+.2f}%")
            else:
                st.metric(label=symbol, value="--", delta="")
    
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Positive Surprises")
        st.markdown("""
        <div style="background: #ecfdf5; padding: 1rem; border-radius: 8px; border: 1px solid #d1fae5;">
            <p style="font-size: 0.875rem; color: #065f46;">When actual data beats forecast expectations:</p>
            <ul style="font-size: 0.875rem; color: #047857;">
                <li>Equities typically rally</li>
                <li>USD tends to strengthen</li>
                <li>Bonds often sell off</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("### Negative Surprises")
        st.markdown("""
        <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; border: 1px solid #fecaca;">
            <p style="font-size: 0.875rem; color: #991b1b;">When actual data misses forecast expectations:</p>
            <ul style="font-size: 0.875rem; color: #dc2626;">
                <li>Equities often decline</li>
                <li>USD may weaken</li>
                <li>Flight to safety bonds</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.info("📊 Historical impact data will appear here as events are tracked over time.")


def main():
    """Main application entry point."""
    # Get prices ONCE at the start - single source of truth for this render
    snapshot = get_live_prices()
    
    # Render header with navigation
    render_header()
    
    st.markdown("---")
    
    # Render ticker with the same snapshot
    render_ticker(snapshot)
    
    st.markdown("---")
    
    # Render current page with the same snapshot
    if st.session_state.current_page == "Dashboard":
        render_dashboard(snapshot)
    elif st.session_state.current_page == "Analysis":
        render_analysis(snapshot)
    elif st.session_state.current_page == "Calendar":
        render_calendar()
    
    # Auto-refresh toggle in sidebar
    with st.sidebar:
        st.markdown("### ⚙️ Settings")
        st.markdown("**Data Source:** Yahoo Finance + CoinGecko")
        st.markdown("**Update Interval:** 30 seconds")
        if st.checkbox("Auto-refresh (5s)", value=False):
            time.sleep(5)
            st.rerun()


if __name__ == "__main__":
    main()
