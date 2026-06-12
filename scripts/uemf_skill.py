import requests
import datetime

# Configuration - API runs locally on the VPS on port 8080
UEMF_API_URL = "http://127.0.0.1:8080/api"
TELEGRAM_BOT_SECRET = "uemf-telegram-secret-key"

headers = {
    "X-Telegram-Bot-Secret": TELEGRAM_BOT_SECRET,
    "Content-Type": "application/json"
}

def handle_command(command: str, chat_id: int, args: list) -> str:
    """
    Main entry point for handling Telegram commands passed from OpenClaw.
    """
    cmd = command.lower().strip()
    
    if cmd == "/help":
        return get_help_message()
    elif cmd == "/today":
        return get_today_planning(chat_id)
    elif cmd == "/week":
        return get_week_planning(chat_id)
    elif cmd == "/absence":
        return get_absences(chat_id)
    elif cmd == "/progress":
        return get_progress(chat_id)
    elif cmd == "/start":
        if args:
            return link_user(chat_id, args[0])
        return "Welcome to the UEMF Bot! To link your account, please log in to the UEMF Web App and generate a Link Code."
    else:
        return "Unknown command. Type /help to see the list of available commands."

def get_help_message() -> str:
    return (
        "📚 *UEMF Telegram Bot - Available Commands*\n\n"
        "📅 `/today` - Daily planning / Class schedule for today\n"
        "📅 `/week` - Complete weekly class schedule\n"
        "❌ `/absence` - Recent absences & monthly summary\n"
        "📈 `/progress` - Completion percentage of currently enrolled modules\n"
        "❓ `/help` - Show this list of available commands"
    )

def link_user(chat_id: int, token: str) -> str:
    try:
        url = f"{UEMF_API_URL}/telegram/verify"
        payload = {"token": token, "chatId": str(chat_id)}
        res = requests.post(url, json=payload, headers=headers)
        
        if res.status_code == 200:
            data = res.json()
            return f"✅ *Successfully Linked!*\nWelcome, *{data.get('username')}* ({data.get('role')}). You can now use all commands to view your data."
        else:
            return "❌ *Link Failed*: The link token is invalid, expired, or has already been used."
    except Exception as e:
        return f"❌ *Connection Error*: Unable to communicate with UEMF Server. Details: {str(e)}"

def get_today_planning(chat_id: int) -> str:
    try:
        url = f"{UEMF_API_URL}/telegram/planning/today?chatId={chatId}"
        res = requests.get(url, headers=headers)
        
        if res.status_code == 404:
            return "⚠️ You haven't linked your UEMF account yet. Please link it using the code generated from the UEMF Web App."
        elif res.status_code != 200:
            return "❌ Error retrieving schedule. Please try again later."
            
        data = res.json()
        today = data.get("today", "Today")
        schedules = data.get("schedules", [])
        
        if not schedules:
            return f"📅 *Schedule for {today}:*\n\n🎉 No classes scheduled for today!"
            
        msg = f"📅 *Schedule for {today}:*\n\n"
        for s in schedules:
            msg += (
                f"⏰ *{s['startTime']} - {s['endTime']}*\n"
                f"📖 *{s['courseCode']}*: {s['courseName']}\n"
                f"📍 Room: {s['room']} ({s['building']})\n"
                f"👤 Instructor: {s.get('facultyName', 'N/A')}\n"
                f"🏷️ Type: {s['type'].capitalize()}\n"
                f"──────────────────\n"
            )
        return msg
    except Exception as e:
        return f"❌ Connection Error: {str(e)}"

def get_week_planning(chat_id: int) -> str:
    try:
        url = f"{UEMF_API_URL}/telegram/planning/week?chatId={chatId}"
        res = requests.get(url, headers=headers)
        
        if res.status_code == 404:
            return "⚠️ You haven't linked your UEMF account yet."
        elif res.status_code != 200:
            return "❌ Error retrieving weekly schedule."
            
        data = res.json()
        schedules = data.get("schedules", [])
        
        if not schedules:
            return "📅 *Weekly Schedule:*\n\nNo classes found in the weekly schedule."
            
        msg = "📅 *Weekly Schedule:*\n\n"
        current_day = ""
        for s in schedules:
            if s['dayOfWeek'] != current_day:
                current_day = s['dayOfWeek']
                msg += f"\n🔷 *{current_day}*\n"
            msg += (
                f"  • {s['startTime']}-{s['endTime']} | *{s['courseCode']}* ({s['type'].capitalize()})\n"
                f"    Room: {s['room']} | {s.get('facultyName', 'N/A')}\n"
            )
        return msg
    except Exception as e:
        return f"❌ Connection Error: {str(e)}"

def get_absences(chat_id: int) -> str:
    try:
        url = f"{UEMF_API_URL}/telegram/absences?chatId={chatId}"
        res = requests.get(url, headers=headers)
        
        if res.status_code == 404:
            return "⚠️ You haven't linked your UEMF account yet."
        elif res.status_code == 400:
            return "ℹ️ Absences tracking is only available for student accounts."
        elif res.status_code != 200:
            return "❌ Error retrieving absences data."
            
        data = res.json()
        absences = data.get("absences", [])
        
        msg = (
            f"❌ *Absences Overview*\n"
            f"• *Total Absences:* {data.get('total', 0)}\n"
            f"• *Absences this month:* {data.get('currentMonthTotal', 0)}\n\n"
        )
        
        if not absences:
            msg += "🎉 Outstanding! You have no recorded absences."
            return msg
            
        msg += "*Recent Absences:*\n"
        for a in absences[:5]: # Show top 5 recent
            date_str = a['date'][:10]
            status_emoji = "🔴" if a['status'] == "unexcused" else "🟢"
            reason_str = f" ({a['reason']})" if a['reason'] else ""
            msg += f"• {date_str} - *{a['courseCode']}*: {status_emoji} {a['status'].capitalize()}{reason_str}\n"
            
        return msg
    except Exception as e:
        return f"❌ Connection Error: {str(e)}"

def get_progress(chat_id: int) -> str:
    try:
        url = f"{UEMF_API_URL}/telegram/progress?chatId={chatId}"
        res = requests.get(url, headers=headers)
        
        if res.status_code == 404:
            return "⚠️ You haven't linked your UEMF account yet."
        elif res.status_code == 400:
            return "ℹ️ Progress tracking is only available for student accounts."
        elif res.status_code != 200:
            return "❌ Error retrieving progress data."
            
        data = res.json()
        progress_list = data.get("progress", [])
        
        if not progress_list:
            return "📈 *Module Progress:* No enrollments found."
            
        msg = "📈 *Module Completion Progress:*\n\n"
        for p in progress_list:
            bar_length = 10
            filled = int(p['progressPercent'] / 10)
            bar = "▓" * filled + "░" * (bar_length - filled)
            msg += (
                f"📖 *{p['courseCode']}* - {p['courseName']}\n"
                f"   `[{bar}]` {p['progressPercent']}%\n"
                f"   Status: {p['status'].capitalize()}\n\n"
            )
        return msg
    except Exception as e:
        return f"❌ Connection Error: {str(e)}"
