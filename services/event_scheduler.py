"""
Event Scheduler - Economic calendar with upcoming events

Manages the schedule of macro economic data releases and 
triggers events when they are due.
"""

import random
import threading
import time
from datetime import datetime
from typing import List, Callable, Optional
from dateutil import parser as date_parser

# Economic calendar with events through 2026
SCHEDULED_EVENTS = [
    # ============ JANUARY 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Dec)', 'date': '2026-01-05T10:00:00', 'forecast': 49.5, 'previous': 49.2, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Dec)', 'date': '2026-01-07T10:00:00', 'forecast': 53.5, 'previous': 52.1, 'importance': 'medium'},
    {'indicator': 'CLAIMS', 'name': 'Initial Jobless Claims', 'date': '2026-01-08T08:30:00', 'forecast': 212, 'previous': 208, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Dec)', 'date': '2026-01-09T08:30:00', 'forecast': 195, 'previous': 227, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Dec)', 'date': '2026-01-13T08:30:00', 'forecast': 2.5, 'previous': 2.7, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Dec)', 'date': '2026-01-14T08:30:00', 'forecast': 0.2, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'CLAIMS', 'name': 'Initial Jobless Claims', 'date': '2026-01-15T08:30:00', 'forecast': 215, 'previous': 211, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Dec)', 'date': '2026-01-16T08:30:00', 'forecast': 0.5, 'previous': 0.7, 'importance': 'medium'},
    {'indicator': 'CLAIMS', 'name': 'Initial Jobless Claims', 'date': '2026-01-22T08:30:00', 'forecast': 218, 'previous': 215, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Jan)', 'date': '2026-01-28T14:00:00', 'forecast': 4.25, 'previous': 4.50, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Advance (Q4 2025)', 'date': '2026-01-29T08:30:00', 'forecast': 2.2, 'previous': 2.8, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Dec)', 'date': '2026-01-29T08:30:00', 'forecast': 2.6, 'previous': 2.8, 'importance': 'high'},
    {'indicator': 'CLAIMS', 'name': 'Initial Jobless Claims', 'date': '2026-01-29T08:30:00', 'forecast': 220, 'previous': 218, 'importance': 'medium'},

    # ============ FEBRUARY 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Jan)', 'date': '2026-02-02T10:00:00', 'forecast': 49.8, 'previous': 49.5, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Jan)', 'date': '2026-02-04T10:00:00', 'forecast': 54.0, 'previous': 53.5, 'importance': 'medium'},
    {'indicator': 'CLAIMS', 'name': 'Initial Jobless Claims', 'date': '2026-02-05T08:30:00', 'forecast': 218, 'previous': 220, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Jan)', 'date': '2026-02-06T08:30:00', 'forecast': 185, 'previous': 212, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Jan)', 'date': '2026-02-11T08:30:00', 'forecast': 2.4, 'previous': 2.5, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Jan)', 'date': '2026-02-12T08:30:00', 'forecast': 0.2, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Jan)', 'date': '2026-02-17T08:30:00', 'forecast': 0.3, 'previous': 0.5, 'importance': 'medium'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Jan)', 'date': '2026-02-26T08:30:00', 'forecast': 2.5, 'previous': 2.6, 'importance': 'high'},

    # ============ MARCH 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Feb)', 'date': '2026-03-02T10:00:00', 'forecast': 50.2, 'previous': 49.8, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Feb)', 'date': '2026-03-04T10:00:00', 'forecast': 54.5, 'previous': 54.0, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Feb)', 'date': '2026-03-06T08:30:00', 'forecast': 175, 'previous': 185, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Feb)', 'date': '2026-03-11T08:30:00', 'forecast': 2.3, 'previous': 2.4, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Feb)', 'date': '2026-03-12T08:30:00', 'forecast': 0.3, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Feb)', 'date': '2026-03-16T08:30:00', 'forecast': 0.4, 'previous': 0.3, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Mar)', 'date': '2026-03-18T14:00:00', 'forecast': 4.00, 'previous': 4.25, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Third Estimate (Q4 2025)', 'date': '2026-03-26T08:30:00', 'forecast': 2.3, 'previous': 2.2, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Feb)', 'date': '2026-03-26T08:30:00', 'forecast': 2.4, 'previous': 2.5, 'importance': 'high'},

    # ============ APRIL 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Mar)', 'date': '2026-04-01T10:00:00', 'forecast': 50.5, 'previous': 50.2, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Mar)', 'date': '2026-04-03T08:30:00', 'forecast': 190, 'previous': 175, 'importance': 'high'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Mar)', 'date': '2026-04-06T10:00:00', 'forecast': 55.0, 'previous': 54.5, 'importance': 'medium'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Mar)', 'date': '2026-04-14T08:30:00', 'forecast': 2.2, 'previous': 2.3, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Mar)', 'date': '2026-04-15T08:30:00', 'forecast': 0.2, 'previous': 0.3, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Mar)', 'date': '2026-04-16T08:30:00', 'forecast': 0.5, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Apr)', 'date': '2026-04-29T14:00:00', 'forecast': 3.75, 'previous': 4.00, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Advance (Q1 2026)', 'date': '2026-04-29T08:30:00', 'forecast': 2.0, 'previous': 2.3, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Mar)', 'date': '2026-04-30T08:30:00', 'forecast': 2.3, 'previous': 2.4, 'importance': 'high'},

    # ============ MAY 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Apr)', 'date': '2026-05-01T10:00:00', 'forecast': 50.8, 'previous': 50.5, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Apr)', 'date': '2026-05-05T10:00:00', 'forecast': 55.2, 'previous': 55.0, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Apr)', 'date': '2026-05-08T08:30:00', 'forecast': 180, 'previous': 190, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Apr)', 'date': '2026-05-12T08:30:00', 'forecast': 2.1, 'previous': 2.2, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Apr)', 'date': '2026-05-13T08:30:00', 'forecast': 0.2, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Apr)', 'date': '2026-05-15T08:30:00', 'forecast': 0.4, 'previous': 0.5, 'importance': 'medium'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Apr)', 'date': '2026-05-28T08:30:00', 'forecast': 2.3, 'previous': 2.3, 'importance': 'high'},

    # ============ JUNE 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (May)', 'date': '2026-06-01T10:00:00', 'forecast': 51.0, 'previous': 50.8, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (May)', 'date': '2026-06-03T10:00:00', 'forecast': 55.5, 'previous': 55.2, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (May)', 'date': '2026-06-05T08:30:00', 'forecast': 170, 'previous': 180, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (May)', 'date': '2026-06-10T08:30:00', 'forecast': 2.0, 'previous': 2.1, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (May)', 'date': '2026-06-11T08:30:00', 'forecast': 0.1, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (May)', 'date': '2026-06-16T08:30:00', 'forecast': 0.3, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Jun)', 'date': '2026-06-17T14:00:00', 'forecast': 3.50, 'previous': 3.75, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Third Estimate (Q1 2026)', 'date': '2026-06-25T08:30:00', 'forecast': 2.1, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (May)', 'date': '2026-06-25T08:30:00', 'forecast': 2.2, 'previous': 2.3, 'importance': 'high'},

    # ============ JULY 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Jun)', 'date': '2026-07-01T10:00:00', 'forecast': 51.2, 'previous': 51.0, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Jun)', 'date': '2026-07-02T08:30:00', 'forecast': 165, 'previous': 170, 'importance': 'high'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Jun)', 'date': '2026-07-06T10:00:00', 'forecast': 55.8, 'previous': 55.5, 'importance': 'medium'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Jun)', 'date': '2026-07-14T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Jun)', 'date': '2026-07-15T08:30:00', 'forecast': 0.1, 'previous': 0.1, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Jun)', 'date': '2026-07-16T08:30:00', 'forecast': 0.4, 'previous': 0.3, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Jul)', 'date': '2026-07-29T14:00:00', 'forecast': 3.50, 'previous': 3.50, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Advance (Q2 2026)', 'date': '2026-07-30T08:30:00', 'forecast': 2.4, 'previous': 2.1, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Jun)', 'date': '2026-07-30T08:30:00', 'forecast': 2.1, 'previous': 2.2, 'importance': 'high'},

    # ============ AUGUST 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Jul)', 'date': '2026-08-03T10:00:00', 'forecast': 51.5, 'previous': 51.2, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Jul)', 'date': '2026-08-05T10:00:00', 'forecast': 56.0, 'previous': 55.8, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Jul)', 'date': '2026-08-07T08:30:00', 'forecast': 175, 'previous': 165, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Jul)', 'date': '2026-08-12T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Jul)', 'date': '2026-08-13T08:30:00', 'forecast': 0.1, 'previous': 0.1, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Jul)', 'date': '2026-08-14T08:30:00', 'forecast': 0.4, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Jul)', 'date': '2026-08-27T08:30:00', 'forecast': 2.0, 'previous': 2.1, 'importance': 'high'},

    # ============ SEPTEMBER 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Aug)', 'date': '2026-09-01T10:00:00', 'forecast': 51.8, 'previous': 51.5, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Aug)', 'date': '2026-09-03T10:00:00', 'forecast': 56.2, 'previous': 56.0, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Aug)', 'date': '2026-09-04T08:30:00', 'forecast': 180, 'previous': 175, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Aug)', 'date': '2026-09-15T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Aug)', 'date': '2026-09-16T08:30:00', 'forecast': 0.1, 'previous': 0.1, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Sep)', 'date': '2026-09-16T14:00:00', 'forecast': 3.25, 'previous': 3.50, 'importance': 'critical'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Aug)', 'date': '2026-09-17T08:30:00', 'forecast': 0.3, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Third Estimate (Q2 2026)', 'date': '2026-09-24T08:30:00', 'forecast': 2.5, 'previous': 2.4, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Aug)', 'date': '2026-09-25T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},

    # ============ OCTOBER 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Sep)', 'date': '2026-10-01T10:00:00', 'forecast': 52.0, 'previous': 51.8, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Sep)', 'date': '2026-10-02T08:30:00', 'forecast': 185, 'previous': 180, 'importance': 'high'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Sep)', 'date': '2026-10-05T10:00:00', 'forecast': 56.5, 'previous': 56.2, 'importance': 'medium'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Sep)', 'date': '2026-10-13T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Sep)', 'date': '2026-10-14T08:30:00', 'forecast': 0.2, 'previous': 0.1, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Sep)', 'date': '2026-10-16T08:30:00', 'forecast': 0.4, 'previous': 0.3, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Oct)', 'date': '2026-10-28T14:00:00', 'forecast': 3.25, 'previous': 3.25, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Advance (Q3 2026)', 'date': '2026-10-29T08:30:00', 'forecast': 2.6, 'previous': 2.5, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Sep)', 'date': '2026-10-30T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},

    # ============ NOVEMBER 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Oct)', 'date': '2026-11-02T10:00:00', 'forecast': 52.2, 'previous': 52.0, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Oct)', 'date': '2026-11-04T10:00:00', 'forecast': 56.8, 'previous': 56.5, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Oct)', 'date': '2026-11-06T08:30:00', 'forecast': 190, 'previous': 185, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Oct)', 'date': '2026-11-12T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Oct)', 'date': '2026-11-13T08:30:00', 'forecast': 0.2, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Oct)', 'date': '2026-11-17T08:30:00', 'forecast': 0.5, 'previous': 0.4, 'importance': 'medium'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Oct)', 'date': '2026-11-25T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},

    # ============ DECEMBER 2026 ============
    {'indicator': 'PMI', 'name': 'ISM Manufacturing PMI (Nov)', 'date': '2026-12-01T10:00:00', 'forecast': 52.5, 'previous': 52.2, 'importance': 'medium'},
    {'indicator': 'PMI', 'name': 'ISM Services PMI (Nov)', 'date': '2026-12-03T10:00:00', 'forecast': 57.0, 'previous': 56.8, 'importance': 'medium'},
    {'indicator': 'NFP', 'name': 'Non-Farm Payrolls (Nov)', 'date': '2026-12-04T08:30:00', 'forecast': 195, 'previous': 190, 'importance': 'high'},
    {'indicator': 'CPI', 'name': 'CPI YoY (Nov)', 'date': '2026-12-10T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
    {'indicator': 'PPI', 'name': 'PPI MoM (Nov)', 'date': '2026-12-11T08:30:00', 'forecast': 0.2, 'previous': 0.2, 'importance': 'medium'},
    {'indicator': 'RETAIL', 'name': 'Advance Retail Sales (Nov)', 'date': '2026-12-15T08:30:00', 'forecast': 0.6, 'previous': 0.5, 'importance': 'medium'},
    {'indicator': 'FOMC', 'name': 'FOMC Rate Decision (Dec)', 'date': '2026-12-16T14:00:00', 'forecast': 3.00, 'previous': 3.25, 'importance': 'critical'},
    {'indicator': 'GDP', 'name': 'GDP QoQ Third Estimate (Q3 2026)', 'date': '2026-12-22T08:30:00', 'forecast': 2.7, 'previous': 2.6, 'importance': 'high'},
    {'indicator': 'PCE', 'name': 'Core PCE Price Index YoY (Nov)', 'date': '2026-12-23T08:30:00', 'forecast': 2.0, 'previous': 2.0, 'importance': 'high'},
]


class EventScheduler:
    """Manages the economic calendar and event triggering."""
    
    def __init__(self):
        self.events = SCHEDULED_EVENTS
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._on_upcoming_callbacks: List[Callable] = []
        self._on_released_callbacks: List[Callable] = []
        self._triggered_events = set()
    
    def on_event_upcoming(self, callback: Callable):
        """Register callback for when an event is approaching (5 min warning)."""
        self._on_upcoming_callbacks.append(callback)
    
    def on_event_released(self, callback: Callable):
        """Register callback for when an event is released."""
        self._on_released_callbacks.append(callback)
    
    def start(self):
        """Start the event scheduler in a background thread."""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self._thread.start()
        print("Event scheduler active")
    
    def stop(self):
        """Stop the scheduler."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=1)
            self._thread = None
    
    def _scheduler_loop(self):
        """Main scheduler loop - checks for events every 10 seconds."""
        while self._running:
            self._check_events()
            time.sleep(10)
    
    def _check_events(self):
        """Check for events that need to be triggered."""
        now = datetime.utcnow()
        
        for event in self.events:
            event_time = date_parser.parse(event['date']).replace(tzinfo=None)
            event_key = f"{event['indicator']}-{event['date']}"
            
            if event_key in self._triggered_events:
                continue
            
            minutes_until = (event_time - now).total_seconds() / 60
            
            # 5 minute warning
            if 4.5 <= minutes_until <= 5.5:
                self._emit_upcoming(event, int(minutes_until))
            
            # Event release (with simulated actual value)
            if -0.5 <= minutes_until <= 0.5:
                self._emit_released(event)
                self._triggered_events.add(event_key)
    
    def _emit_upcoming(self, event: dict, minutes_until: int):
        """Emit upcoming event notification."""
        for callback in self._on_upcoming_callbacks:
            try:
                callback({**event, 'minutes_until': minutes_until})
            except Exception as e:
                print(f"Error in upcoming callback: {e}")
    
    def _emit_released(self, event: dict):
        """Emit event release with simulated actual value."""
        # Simulate actual value (random variation from forecast)
        forecast = event['forecast']
        variation = random.uniform(-0.15, 0.15)
        
        if isinstance(forecast, (int, float)):
            actual = round(forecast * (1 + variation), 2)
        else:
            actual = forecast
        
        surprise = ((actual - forecast) / abs(forecast)) * 100 if forecast else 0
        
        released_event = {
            **event,
            'actual': actual,
            'surprise': round(surprise, 2)
        }
        
        for callback in self._on_released_callbacks:
            try:
                callback(released_event)
            except Exception as e:
                print(f"Error in released callback: {e}")
    
    def get_upcoming_events(self) -> List[dict]:
        """Get all upcoming events from now."""
        now = datetime.utcnow()
        upcoming = []
        
        for event in self.events:
            event_time = date_parser.parse(event['date']).replace(tzinfo=None)
            if event_time > now:
                upcoming.append(event)
        
        return sorted(upcoming, key=lambda e: e['date'])
    
    def get_events_for_date(self, date: datetime) -> List[dict]:
        """Get events scheduled for a specific date."""
        return [
            event for event in self.events
            if date_parser.parse(event['date']).date() == date.date()
        ]
