# Configurare Finală - Notificări Cron Job

## ✅ Ce am făcut deja

1. ✅ **Edge Function deployment** - Funcția `hyper-handler` este deja deployment
2. ✅ **Cron Job creat** - Job-ul rulează zilnic la 9 AM UTC
3. ✅ **VAPID Keys generate** - Cheile sunt generate mai jos

## 🔑 VAPID Keys Generate

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMDbSoRJfzWH_RP2HsRzauPbNMsL0QrEz3eFRAdUFWSAHIsULfJrZSP-1AJKaTRRwnVGyTly3Ttu0c9aRmUA--g

VAPID_PRIVATE_KEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgTjpuN3aPIahoPlvsk22DghF4UEqlnstRlQDwzuMaNMOhRANCAAQwNtKhEl_NYf9E_YexHNq49s0ywvRCsTPd4VEB1QVZIAcixQt8mtlI_7UAkppNFHCdUbJOXLdO27Rz1pGZQD76
```

## 📝 Pași pentru finalizare

### Pasul 1: Adaugă VAPID Keys în Supabase

**Opțiunea A: Via Supabase Dashboard (Recomandat)**

1. Mergi la: https://supabase.com/dashboard/project/fonwcqxjwuubnuaavgyr/settings/vault

2. Click pe **"New secret"** sau **"Add new secret"**

3. Adaugă prima cheie:
   - **Name**: `VAPID_PUBLIC_KEY`
   - **Value**: `MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMDbSoRJfzWH_RP2HsRzauPbNMsL0QrEz3eFRAdUFWSAHIsULfJrZSP-1AJKaTRRwnVGyTly3Ttu0c9aRmUA--g`
   - Click **"Add secret"**

4. Adaugă a doua cheie:
   - **Name**: `VAPID_PRIVATE_KEY`
   - **Value**: `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgTjpuN3aPIahoPlvsk22DghF4UEqlnstRlQDwzuMaNMOhRANCAAQwNtKhEl_NYf9E_YexHNq49s0ywvRCsTPd4VEB1QVZIAcixQt8mtlI_7UAkppNFHCdUbJOXLdO27Rz1pGZQD76`
   - Click **"Add secret"**

**Opțiunea B: Via SQL (Alternativă)**

Poți rula acest SQL în Supabase SQL Editor:

```sql
-- Adaugă VAPID keys în Vault
SELECT vault.create_secret(
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMDbSoRJfzWH_RP2HsRzauPbNMsL0QrEz3eFRAdUFWSAHIsULfJrZSP-1AJKaTRRwnVGyTly3Ttu0c9aRmUA--g',
  'VAPID_PUBLIC_KEY'
);

SELECT vault.create_secret(
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgTjpuN3aPIahoPlvsk22DghF4UEqlnstRlQDwzuMaNMOhRANCAAQwNtKhEl_NYf9E_YexHNq49s0ywvRCsTPd4VEB1QVZIAcixQt8mtlI_7UAkppNFHCdUbJOXLdO27Rz1pGZQD76',
  'VAPID_PRIVATE_KEY'
);
```

### Pasul 2: Adaugă VAPID Public Key în .env.local

Deschide fișierul `apps/web/.env.local` și adaugă:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMDbSoRJfzWH_RP2HsRzauPbNMsL0QrEz3eFRAdUFWSAHIsULfJrZSP-1AJKaTRRwnVGyTly3Ttu0c9aRmUA--g
```

**IMPORTANT**: Nu adăuga `VAPID_PRIVATE_KEY` în `.env.local` - aceasta trebuie să rămână doar în Supabase Vault!

### Pasul 3: Testează funcția

1. **Test manual via Dashboard**:
   - Mergi la: https://supabase.com/dashboard/project/fonwcqxjwuubnuaavgyr/functions
   - Click pe `hyper-handler`
   - Click pe **"Invoke"** sau **"Test"**
   - Verifică logs-urile

2. **Test manual via cURL**:
   ```bash
   curl -X POST https://fonwcqxjwuubnuaavgyr.supabase.co/functions/v1/hyper-handler \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Verifică răspunsul**:
   ```json
   {
     "success": true,
     "message": "No coupons expiring soon" sau "Notification job completed",
     "sent": 0,
     "failed": 0
   }
   ```

### Pasul 4: Verifică Cron Job-ul

Cron job-ul este deja configurat și va rula automat zilnic la 9 AM UTC.

Pentru a verifica:

```sql
-- Vezi toate cron jobs
SELECT * FROM cron.job;

-- Vezi istoricul execuțiilor
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## 📊 Monitorizare

### Verifică Logs-urile

1. **Edge Function Logs**:
   - Dashboard → Edge Functions → hyper-handler → Logs

2. **Notification Logs în Database**:
   ```sql
   SELECT * FROM notification_logs 
   ORDER BY sent_at DESC 
   LIMIT 10;
   ```

3. **Cron Job History**:
   ```sql
   SELECT 
     jobid,
     runid,
     job_pid,
     database,
     username,
     command,
     status,
     return_message,
     start_time,
     end_time
   FROM cron.job_run_details
   WHERE jobid = 1
   ORDER BY start_time DESC
   LIMIT 10;
   ```

## 🎯 Ce face Cron Job-ul

Cron job-ul rulează **zilnic la 9 AM UTC** și:

1. ✅ Caută cupoane care expiră în 7, 3, sau 1 zi
2. ✅ Verifică preferințele de reminder ale fiecărui user
3. ✅ Trimite notificări push către utilizatorii care au activat reminder-ele
4. ✅ Loghează toate notificările în `notification_logs`
5. ✅ Dezactivează subscription-urile invalide
6. ✅ Previne notificări duplicate (deduplication)

## 🔍 Troubleshooting

### Notificările nu se trimit

1. **Verifică VAPID keys**:
   ```sql
   SELECT name FROM vault.secrets WHERE name LIKE 'VAPID%';
   ```

2. **Verifică dacă există cupoane care expiră**:
   ```sql
   SELECT * FROM coupons 
   WHERE valid_until BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7;
   ```

3. **Verifică preferințele utilizatorilor**:
   ```sql
   SELECT * FROM reminder_preferences 
   WHERE remind_7_days = true OR remind_3_days = true OR remind_1_day = true;
   ```

4. **Verifică push subscriptions**:
   ```sql
   SELECT COUNT(*) FROM push_subscriptions;
   ```

### Cron job-ul nu rulează

1. **Verifică că job-ul este activ**:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-expiry-notifications-daily';
   ```

2. **Verifică logs-urile**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = 1 
   ORDER BY start_time DESC 
   LIMIT 5;
   ```

## ✅ Checklist Final

- [ ] VAPID keys adăugate în Supabase Vault
- [ ] VAPID public key adăugată în `.env.local`
- [ ] Funcția testată manual (invoke)
- [ ] Cron job verificat în database
- [ ] Logs-urile verificate
- [ ] Aplicația web repornită (pentru a încărca noua cheie publică)

## 🎉 Gata!

Odată ce ai completat pașii de mai sus, sistemul de notificări este complet funcțional:

- ✅ Edge Function deployment
- ✅ Cron job configurat (9 AM UTC zilnic)
- ✅ VAPID keys configurate
- ✅ Deduplication implementat
- ✅ Error handling complet
- ✅ Logging complet

Notificările vor fi trimise automat zilnic la 9 AM UTC pentru toate cuponele care expiră în 7, 3, sau 1 zi! 🚀
