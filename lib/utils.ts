import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function languageToLocale(language: string): string {
  switch (language) {
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    default:
      return "en-US";
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short",
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const messages: Record<string, Record<string, string>> = {
  en: {
    "nav.overview": "Overview",
    "nav.accounts": "Accounts",
    "nav.cards": "Cards",
    "nav.transfers": "Transfers",
    "nav.settings": "Settings",
    "nav.analytics": "Analytics",
    "overview.totalBalance": "Total Balance",
    "overview.incomeMonth": "Income (Month)",
    "overview.expensesMonth": "Expenses (Month)",
    "overview.savingsGoals": "Savings Goals",
    "overview.recentTransactions": "Recent Transactions",
    "overview.financialAnalysis": "Financial Analysis",
    "overview.incomeVsExpenses": "Income vs Expenses over time",
    "overview.acrossAllAccounts": "Across all accounts",
    "overview.totalDeposits": "Total deposits",
    "overview.withdrawalsTransfers": "Withdrawals & transfers",
    "transfer.title": "Transfer money",
    "transfer.subtitle":
      "Move funds securely between your accounts or recipients.",
    "transfer.paymentTypeLabel": "Payment Type",
    "transfer.paymentTypeHelper":
      "Choose how you would like this transfer to be sent.",
    "transfer.compareTrigger": "Compare methods",
    "transfer.securityInfoTitle": "Security Info",
    "transfer.securityLine1": "Transfers are encrypted and secure.",
    "transfer.securityLine2": "Internal transfers are processed instantly.",
    "transfer.securityLine3": "Wire transfers may take 1-3 business days.",
    "transfer.limitsTitle": "Transfer Limits",
    "transfer.dailyLimitLabel": "Daily Limit",
    "transfer.usedTodayLabel": "Used Today",
    "transfer.remainingLimitPrefix":
      "Remaining daily limit after this transfer:",
    "transfer.feesTitle": "Fees",
    "transfer.feesEmpty":
      "Select an amount and payment type to see estimated fees.",
    "transfer.processing": "Processing...",
    "transfer.nextReview": "Next: Review details",
    "transfer.nextVerify": "Next: Verify code",
    "transfer.recipientsLabel": "Recipients",
    "transfer.recipientsHelper":
      "Select a saved or recent recipient, or add a new one.",
    "transfer.toAccountLabel": "Recipient Account Number",
    "transfer.toAccountPlaceholder": "Enter account number",
    "transfer.toAccountHelper":
      "Double-check the account number before sending.",
    "transfer.recipientNameLabel": "Recipient Name",
    "transfer.recipientNamePlaceholder": "Enter recipient's full name",
    "transfer.recipientNameHelper":
      "Use the full legal name as it appears on the account.",
    "transfer.swiftLabel": "SWIFT / BIC Code",
    "transfer.swiftPlaceholder": "e.g. BOFAUS3N",
    "transfer.swiftHelper": "8–11 characters, usually letters and numbers.",
    "transfer.bankNameLabel": "Bank Name",
    "transfer.bankNamePlaceholder": "Recipient Bank Name",
    "transfer.bankNameHelper": "Bank where the recipient account is held.",
    "transfer.routingLabel": "Routing Number (Optional)",
    "transfer.routingPlaceholder": "e.g. 021000021",
    "transfer.routingHelper":
      "Helps some banks route international wires faster.",
    "transfer.descriptionLabel": "Reference / Description",
    "transfer.descriptionPlaceholder": "e.g. Rent payment",
    "transfer.descriptionHelper":
      "Shown on your statement and may be shared with the recipient.",
    "transfer.compareTitle": "Compare transfer methods",
    "transfer.compareDescription":
      "Review speed, fees, and delivery timing before choosing how to send this transfer.",
    "transfer.compareMethod": "Method",
    "transfer.compareSpeed": "Speed",
    "transfer.compareFees": "Fees",
    "transfer.compareDelivery": "Delivery estimate",
    "transfer.compareFeesPrefix": "Fees:",
    "transfer.compareCutoffNote":
      "Same-day domestic wires depend on bank cutoff times and business days.",
    "settings.title": "Settings",
    "settings.subtitle":
      "Manage your personal information, security, and app preferences.",
    "settings.profileTab": "Profile",
    "settings.securityTab": "Security",
    "settings.notificationsTab": "Notifications",
    "settings.preferencesTab": "Preferences",
    "settings.preferencesTitle": "App Preferences",
    "settings.preferencesSubtitle":
      "Customize your regional and visual settings.",
    "settings.languageLabel": "Language",
    "settings.currencyLabel": "Currency",
    "settings.notification.emailLabel": "Email Notifications",
    "settings.notification.emailDesc": "Receive updates via email",
    "settings.notification.smsLabel": "SMS Notifications",
    "settings.notification.smsDesc": "Receive updates via text message",
    "settings.notification.transactionLabel": "Transaction Alerts",
    "settings.notification.transactionDesc":
      "Get notified for every transaction",
    "settings.notification.pushLabel": "Push Notifications",
    "settings.notification.pushDesc": "Receive push notifications",
    "error.transfer.selectMethod": "Choose a payment type to continue.",
    "error.transfer.selectSource": "Please select a source account.",
    "error.transfer.amountRequired": "Enter an amount greater than zero.",
    "error.transfer.amountExceeds":
      "Amount exceeds available balance for this account.",
    "error.transfer.toAccountRequired": "Enter the recipient account number.",
    "error.transfer.descriptionRequired":
      "Add a short reference for this transfer.",
    "error.transfer.recipientNameRequired": "Enter the recipient name.",
    "error.transfer.swiftRequired": "Enter the SWIFT / BIC code.",
    "error.transfer.bankNameRequired": "Enter the recipient bank name.",
    "error.transfer.exceedsDailyLimit":
      "This transfer exceeds your daily limit.",
    "error.transfer.scheduleDateRequired": "Select a date for this transfer.",
    "error.transfer.scheduleDatePast": "Choose a date today or later.",
    "error.transfer.scheduleOccurrencesRequired":
      "Enter how many transfers should occur.",
    "error.transfer.otpRequired": "Enter the verification code we sent to you.",
    "error.transfer.otpInvalid":
      "Invalid or expired code. Try again or resend.",
    "error.transfer.requestOtpFailed":
      "Could not send verification code. Please try again.",
    "error.transfer.failed": "Transfer failed. Check details and try again.",
    "receipt.title": "Transfer submitted",
    "receipt.description":
      "Here is a summary of your transfer. You can keep this for your records.",
    "receipt.from": "From",
    "receipt.to": "To",
    "receipt.amount": "Amount",
    "receipt.method": "Method",
    "receipt.schedule": "Schedule",
    "receipt.scheduleNow": "Send now",
    "receipt.reference": "Reference",
    "receipt.referenceNotProvided": "Not provided",
    "receipt.confirmationId": "Confirmation ID",
    "receipt.submittedAt": "Submitted at",
    "receipt.share": "Share",
    "receipt.downloadPdf": "Download PDF",
    "receipt.documentTitle": "Transfer receipt",
    "receipt.documentHeading": "Transfer receipt",
    "common.close": "Close",
  },
  es: {
    "nav.overview": "Resumen",
    "nav.accounts": "Cuentas",
    "nav.cards": "Tarjetas",
    "nav.transfers": "Transferencias",
    "nav.settings": "Configuración",
    "nav.analytics": "Analíticas",
    "overview.totalBalance": "Saldo total",
    "overview.incomeMonth": "Ingresos (mes)",
    "overview.expensesMonth": "Gastos (mes)",
    "overview.savingsGoals": "Metas de ahorro",
    "overview.recentTransactions": "Transacciones recientes",
    "overview.financialAnalysis": "Análisis financiero",
    "overview.incomeVsExpenses": "Ingresos vs gastos en el tiempo",
    "overview.acrossAllAccounts": "En todas las cuentas",
    "overview.totalDeposits": "Depósitos totales",
    "overview.withdrawalsTransfers": "Retiros y transferencias",
    "transfer.title": "Transferir dinero",
    "transfer.subtitle":
      "Mueva fondos de forma segura entre sus cuentas o destinatarios.",
    "transfer.paymentTypeLabel": "Tipo de pago",
    "transfer.paymentTypeHelper":
      "Elija cómo desea que se envíe esta transferencia.",
    "transfer.compareTrigger": "Comparar métodos",
    "transfer.securityInfoTitle": "Información de seguridad",
    "transfer.securityLine1":
      "Las transferencias están cifradas y son seguras.",
    "transfer.securityLine2":
      "Las transferencias internas se procesan al instante.",
    "transfer.securityLine3":
      "Las transferencias bancarias pueden tardar de 1 a 3 días hábiles.",
    "transfer.limitsTitle": "Límites de transferencia",
    "transfer.dailyLimitLabel": "Límite diario",
    "transfer.usedTodayLabel": "Usado hoy",
    "transfer.remainingLimitPrefix":
      "Límite diario restante después de esta transferencia:",
    "transfer.feesTitle": "Comisiones",
    "transfer.feesEmpty":
      "Seleccione un importe y un tipo de pago para ver las comisiones.",
    "transfer.processing": "Procesando...",
    "transfer.nextReview": "Siguiente: Revisar detalles",
    "transfer.nextVerify": "Siguiente: Verificar código",
    "transfer.recipientsLabel": "Destinatarios",
    "transfer.recipientsHelper":
      "Seleccione un destinatario guardado o reciente, o añada uno nuevo.",
    "transfer.toAccountLabel": "Número de cuenta del destinatario",
    "transfer.toAccountPlaceholder": "Introduzca el número de cuenta",
    "transfer.toAccountHelper":
      "Verifique el número de cuenta antes de enviar.",
    "transfer.recipientNameLabel": "Nombre del destinatario",
    "transfer.recipientNamePlaceholder":
      "Introduzca el nombre completo del destinatario",
    "transfer.recipientNameHelper":
      "Utilice el nombre legal completo tal como aparece en la cuenta.",
    "transfer.swiftLabel": "Código SWIFT / BIC",
    "transfer.swiftPlaceholder": "p. ej. BOFAUS3N",
    "transfer.swiftHelper":
      "Entre 8 y 11 caracteres, normalmente letras y números.",
    "transfer.bankNameLabel": "Nombre del banco",
    "transfer.bankNamePlaceholder": "Banco del destinatario",
    "transfer.bankNameHelper":
      "Banco en el que se mantiene la cuenta del destinatario.",
    "transfer.routingLabel": "Número de ruta (opcional)",
    "transfer.routingPlaceholder": "p. ej. 021000021",
    "transfer.routingHelper":
      "Ayuda a algunos bancos a enrutar más rápido las transferencias.",
    "transfer.descriptionLabel": "Referencia / Descripción",
    "transfer.descriptionPlaceholder": "p. ej. Pago de alquiler",
    "transfer.descriptionHelper":
      "Se mostrará en su estado de cuenta y puede compartirse con el destinatario.",
    "transfer.compareTitle": "Comparar métodos de transferencia",
    "transfer.compareDescription":
      "Revise velocidad, comisiones y tiempos de entrega antes de elegir cómo enviar esta transferencia.",
    "transfer.compareMethod": "Método",
    "transfer.compareSpeed": "Velocidad",
    "transfer.compareFees": "Comisiones",
    "transfer.compareDelivery": "Tiempo de entrega",
    "transfer.compareFeesPrefix": "Comisiones:",
    "transfer.compareCutoffNote":
      "Las transferencias nacionales en el mismo día dependen de la hora límite del banco y de los días hábiles.",
    "settings.title": "Configuración",
    "settings.subtitle":
      "Gestione su información personal, seguridad y preferencias de la aplicación.",
    "settings.profileTab": "Perfil",
    "settings.securityTab": "Seguridad",
    "settings.notificationsTab": "Notificaciones",
    "settings.preferencesTab": "Preferencias",
    "settings.preferencesTitle": "Preferencias de la aplicación",
    "settings.preferencesSubtitle":
      "Personalice sus ajustes regionales y visuales.",
    "settings.languageLabel": "Idioma",
    "settings.currencyLabel": "Moneda",
    "settings.notification.emailLabel": "Notificaciones por correo",
    "settings.notification.emailDesc": "Reciba actualizaciones por correo",
    "settings.notification.smsLabel": "Notificaciones por SMS",
    "settings.notification.smsDesc":
      "Reciba actualizaciones por mensaje de texto",
    "settings.notification.transactionLabel": "Alertas de transacciones",
    "settings.notification.transactionDesc":
      "Reciba una alerta por cada transacción",
    "settings.notification.pushLabel": "Notificaciones push",
    "settings.notification.pushDesc":
      "Reciba notificaciones push en sus dispositivos",
    "error.transfer.selectMethod": "Elija un tipo de pago para continuar.",
    "error.transfer.selectSource": "Seleccione una cuenta de origen.",
    "error.transfer.amountRequired": "Introduzca un importe mayor que cero.",
    "error.transfer.amountExceeds":
      "El importe supera el saldo disponible de esta cuenta.",
    "error.transfer.toAccountRequired":
      "Introduzca el número de cuenta del destinatario.",
    "error.transfer.descriptionRequired":
      "Añada una referencia breve para esta transferencia.",
    "error.transfer.recipientNameRequired":
      "Introduzca el nombre del destinatario.",
    "error.transfer.swiftRequired": "Introduzca el código SWIFT / BIC.",
    "error.transfer.bankNameRequired": "Introduzca el banco del destinatario.",
    "error.transfer.exceedsDailyLimit":
      "Esta transferencia supera su límite diario.",
    "error.transfer.scheduleDateRequired":
      "Seleccione una fecha para esta transferencia.",
    "error.transfer.scheduleDatePast": "Elija una fecha de hoy en adelante.",
    "error.transfer.scheduleOccurrencesRequired":
      "Indique cuántas transferencias deben realizarse.",
    "error.transfer.otpRequired":
      "Introduzca el código de verificación que le enviamos.",
    "error.transfer.otpInvalid":
      "Código no válido o caducado. Inténtelo de nuevo o reenvíelo.",
    "error.transfer.requestOtpFailed":
      "No se pudo enviar el código de verificación. Inténtelo de nuevo.",
    "error.transfer.failed":
      "La transferencia ha fallado. Compruebe los datos e inténtelo de nuevo.",
    "receipt.title": "Transferencia enviada",
    "receipt.description":
      "Aquí tiene un resumen de su transferencia. Puede guardarlo para sus registros.",
    "receipt.from": "Desde",
    "receipt.to": "Hacia",
    "receipt.amount": "Importe",
    "receipt.method": "Método",
    "receipt.schedule": "Programación",
    "receipt.scheduleNow": "Enviar ahora",
    "receipt.reference": "Referencia",
    "receipt.referenceNotProvided": "No especificada",
    "receipt.confirmationId": "ID de confirmación",
    "receipt.submittedAt": "Enviado el",
    "receipt.share": "Compartir",
    "receipt.downloadPdf": "Descargar PDF",
    "receipt.documentTitle": "Comprobante de transferencia",
    "receipt.documentHeading": "Comprobante de transferencia",
    "common.close": "Cerrar",
  },
  fr: {
    "nav.overview": "Vue d’ensemble",
    "nav.accounts": "Comptes",
    "nav.cards": "Cartes",
    "nav.transfers": "Virements",
    "nav.settings": "Paramètres",
    "nav.analytics": "Analytique",
    "overview.totalBalance": "Solde total",
    "overview.incomeMonth": "Revenus (mois)",
    "overview.expensesMonth": "Dépenses (mois)",
    "overview.savingsGoals": "Objectifs d’épargne",
    "overview.recentTransactions": "Transactions récentes",
    "overview.financialAnalysis": "Analyse financière",
    "overview.incomeVsExpenses": "Revenus vs dépenses dans le temps",
    "overview.acrossAllAccounts": "Sur tous les comptes",
    "overview.totalDeposits": "Dépôts totaux",
    "overview.withdrawalsTransfers": "Retraits et virements",
    "transfer.title": "Effectuer un virement",
    "transfer.subtitle":
      "Déplacez des fonds en toute sécurité entre vos comptes ou bénéficiaires.",
    "transfer.paymentTypeLabel": "Type de paiement",
    "transfer.paymentTypeHelper":
      "Choisissez comment vous souhaitez envoyer ce virement.",
    "transfer.compareTrigger": "Comparer les méthodes",
    "transfer.securityInfoTitle": "Informations de sécurité",
    "transfer.securityLine1": "Les virements sont chiffrés et sécurisés.",
    "transfer.securityLine2":
      "Les virements internes sont traités instantanément.",
    "transfer.securityLine3":
      "Les virements internationaux peuvent prendre 1 à 3 jours ouvrables.",
    "transfer.limitsTitle": "Limites de virement",
    "transfer.dailyLimitLabel": "Limite quotidienne",
    "transfer.usedTodayLabel": "Utilisé aujourd’hui",
    "transfer.remainingLimitPrefix":
      "Limite quotidienne restante après ce virement :",
    "transfer.feesTitle": "Frais",
    "transfer.feesEmpty":
      "Choisissez un montant et un type de paiement pour voir les frais estimés.",
    "transfer.processing": "Traitement en cours...",
    "transfer.nextReview": "Suivant : Vérifier les détails",
    "transfer.nextVerify": "Suivant : Vérifier le code",
    "transfer.recipientsLabel": "Bénéficiaires",
    "transfer.recipientsHelper":
      "Sélectionnez un bénéficiaire enregistré ou récent, ou ajoutez-en un nouveau.",
    "transfer.toAccountLabel": "Numéro de compte du bénéficiaire",
    "transfer.toAccountPlaceholder": "Saisissez le numéro de compte",
    "transfer.toAccountHelper": "Vérifiez le numéro de compte avant d’envoyer.",
    "transfer.recipientNameLabel": "Nom du bénéficiaire",
    "transfer.recipientNamePlaceholder":
      "Saisissez le nom complet du bénéficiaire",
    "transfer.recipientNameHelper":
      "Utilisez le nom légal complet tel qu’il apparaît sur le compte.",
    "transfer.swiftLabel": "Code SWIFT / BIC",
    "transfer.swiftPlaceholder": "ex. BOFAUS3N",
    "transfer.swiftHelper":
      "8 à 11 caractères, généralement des lettres et des chiffres.",
    "transfer.bankNameLabel": "Nom de la banque",
    "transfer.bankNamePlaceholder": "Banque du bénéficiaire",
    "transfer.bankNameHelper":
      "Banque où le compte du bénéficiaire est détenu.",
    "transfer.routingLabel": "Numéro de routage (optionnel)",
    "transfer.routingPlaceholder": "ex. 021000021",
    "transfer.routingHelper":
      "Aide certaines banques à traiter plus rapidement les virements.",
    "transfer.descriptionLabel": "Référence / Description",
    "transfer.descriptionPlaceholder": "ex. Paiement de loyer",
    "transfer.descriptionHelper":
      "Affiché sur votre relevé et peut être partagé avec le bénéficiaire.",
    "transfer.compareTitle": "Comparer les méthodes de virement",
    "transfer.compareDescription":
      "Consultez la vitesse, les frais et le délai de traitement avant de choisir comment envoyer ce virement.",
    "transfer.compareMethod": "Méthode",
    "transfer.compareSpeed": "Vitesse",
    "transfer.compareFees": "Frais",
    "transfer.compareDelivery": "Délai de traitement",
    "transfer.compareFeesPrefix": "Frais :",
    "transfer.compareCutoffNote":
      "Les virements domestiques le jour même dépendent des heures limites bancaires et des jours ouvrables.",
    "settings.title": "Paramètres",
    "settings.subtitle":
      "Gérez vos informations personnelles, votre sécurité et vos préférences.",
    "settings.profileTab": "Profil",
    "settings.securityTab": "Sécurité",
    "settings.notificationsTab": "Notifications",
    "settings.preferencesTab": "Préférences",
    "settings.preferencesTitle": "Préférences de l’application",
    "settings.preferencesSubtitle":
      "Personnalisez vos paramètres régionaux et visuels.",
    "settings.languageLabel": "Langue",
    "settings.currencyLabel": "Devise",
    "settings.notification.emailLabel": "Notifications par e-mail",
    "settings.notification.emailDesc": "Recevez des mises à jour par e-mail",
    "settings.notification.smsLabel": "Notifications SMS",
    "settings.notification.smsDesc": "Recevez des mises à jour par SMS",
    "settings.notification.transactionLabel": "Alertes de transaction",
    "settings.notification.transactionDesc":
      "Soyez averti pour chaque transaction",
    "settings.notification.pushLabel": "Notifications push",
    "settings.notification.pushDesc":
      "Recevez des notifications push sur vos appareils",
    "error.transfer.selectMethod":
      "Choisissez un type de paiement pour continuer.",
    "error.transfer.selectSource": "Sélectionnez un compte source.",
    "error.transfer.amountRequired": "Entrez un montant supérieur à zéro.",
    "error.transfer.amountExceeds":
      "Le montant dépasse le solde disponible de ce compte.",
    "error.transfer.toAccountRequired":
      "Saisissez le numéro de compte du bénéficiaire.",
    "error.transfer.descriptionRequired":
      "Ajoutez une courte référence pour ce virement.",
    "error.transfer.recipientNameRequired": "Saisissez le nom du bénéficiaire.",
    "error.transfer.swiftRequired": "Saisissez le code SWIFT / BIC.",
    "error.transfer.bankNameRequired": "Saisissez la banque du bénéficiaire.",
    "error.transfer.exceedsDailyLimit":
      "Ce virement dépasse votre limite quotidienne.",
    "error.transfer.scheduleDateRequired":
      "Sélectionnez une date pour ce virement.",
    "error.transfer.scheduleDatePast":
      "Choisissez une date à partir d’aujourd’hui.",
    "error.transfer.scheduleOccurrencesRequired":
      "Indiquez combien de virements doivent avoir lieu.",
    "error.transfer.otpRequired":
      "Saisissez le code de vérification que nous vous avons envoyé.",
    "error.transfer.otpInvalid":
      "Code non valide ou expiré. Réessayez ou renvoyez-le.",
    "error.transfer.requestOtpFailed":
      "Impossible d’envoyer le code de vérification. Réessayez.",
    "error.transfer.failed":
      "Le virement a échoué. Vérifiez les détails et réessayez.",
    "receipt.title": "Virement envoyé",
    "receipt.description":
      "Voici un récapitulatif de votre virement. Vous pouvez le conserver pour vos dossiers.",
    "receipt.from": "De",
    "receipt.to": "À",
    "receipt.amount": "Montant",
    "receipt.method": "Méthode",
    "receipt.schedule": "Planification",
    "receipt.scheduleNow": "Envoyer maintenant",
    "receipt.reference": "Référence",
    "receipt.referenceNotProvided": "Non renseignée",
    "receipt.confirmationId": "ID de confirmation",
    "receipt.submittedAt": "Envoyé le",
    "receipt.share": "Partager",
    "receipt.downloadPdf": "Télécharger le PDF",
    "receipt.documentTitle": "Reçu de virement",
    "receipt.documentHeading": "Reçu de virement",
    "common.close": "Fermer",
  },
  de: {
    "nav.overview": "Übersicht",
    "nav.accounts": "Konten",
    "nav.cards": "Karten",
    "nav.transfers": "Überweisungen",
    "nav.settings": "Einstellungen",
    "nav.analytics": "Analysen",
    "overview.totalBalance": "Gesamtsaldo",
    "overview.incomeMonth": "Einnahmen (Monat)",
    "overview.expensesMonth": "Ausgaben (Monat)",
    "overview.savingsGoals": "Sparziele",
    "overview.recentTransactions": "Letzte Transaktionen",
    "overview.financialAnalysis": "Finanzanalyse",
    "overview.incomeVsExpenses": "Einnahmen vs. Ausgaben im Zeitverlauf",
    "overview.acrossAllAccounts": "Über alle Konten",
    "overview.totalDeposits": "Gesamteinzahlungen",
    "overview.withdrawalsTransfers": "Abhebungen und Überweisungen",
    "transfer.title": "Geld überweisen",
    "transfer.subtitle":
      "Überweisen Sie Geld sicher zwischen Ihren Konten oder Empfängern.",
    "transfer.paymentTypeLabel": "Zahlungsart",
    "transfer.paymentTypeHelper":
      "Wählen Sie, wie diese Überweisung gesendet werden soll.",
    "transfer.compareTrigger": "Methoden vergleichen",
    "transfer.securityInfoTitle": "Sicherheitsinformationen",
    "transfer.securityLine1": "Überweisungen sind verschlüsselt und sicher.",
    "transfer.securityLine2":
      "Interne Überweisungen werden sofort verarbeitet.",
    "transfer.securityLine3":
      "Auslandsüberweisungen können 1–3 Werktage dauern.",
    "transfer.limitsTitle": "Überweisungslimits",
    "transfer.dailyLimitLabel": "Tageslimit",
    "transfer.usedTodayLabel": "Heute genutzt",
    "transfer.remainingLimitPrefix":
      "Verbleibendes Tageslimit nach dieser Überweisung:",
    "transfer.feesTitle": "Gebühren",
    "transfer.feesEmpty":
      "Wählen Sie einen Betrag und eine Zahlungsart, um geschätzte Gebühren zu sehen.",
    "transfer.processing": "Wird verarbeitet...",
    "transfer.nextReview": "Weiter: Details prüfen",
    "transfer.nextVerify": "Weiter: Code bestätigen",
    "transfer.recipientsLabel": "Empfänger",
    "transfer.recipientsHelper":
      "Wählen Sie einen gespeicherten oder kürzlichen Empfänger oder fügen Sie einen neuen hinzu.",
    "transfer.toAccountLabel": "Kontonummer des Empfängers",
    "transfer.toAccountPlaceholder": "Kontonummer eingeben",
    "transfer.toAccountHelper":
      "Überprüfen Sie die Kontonummer vor dem Senden.",
    "transfer.recipientNameLabel": "Name des Empfängers",
    "transfer.recipientNamePlaceholder":
      "Vollständigen Namen des Empfängers eingeben",
    "transfer.recipientNameHelper":
      "Verwenden Sie den vollständigen rechtlichen Namen wie auf dem Konto.",
    "transfer.swiftLabel": "SWIFT- / BIC-Code",
    "transfer.swiftPlaceholder": "z. B. BOFAUS3N",
    "transfer.swiftHelper": "8–11 Zeichen, in der Regel Buchstaben und Zahlen.",
    "transfer.bankNameLabel": "Bankname",
    "transfer.bankNamePlaceholder": "Bank des Empfängers",
    "transfer.bankNameHelper":
      "Bank, bei der das Konto des Empfängers geführt wird.",
    "transfer.routingLabel": "Routing-Nummer (optional)",
    "transfer.routingPlaceholder": "z. B. 021000021",
    "transfer.routingHelper":
      "Hilft einigen Banken, internationale Überweisungen schneller zu leiten.",
    "transfer.descriptionLabel": "Verwendungszweck / Beschreibung",
    "transfer.descriptionPlaceholder": "z. B. Mietzahlung",
    "transfer.descriptionHelper":
      "Wird auf Ihrem Kontoauszug angezeigt und kann mit dem Empfänger geteilt werden.",
    "transfer.compareTitle": "Überweisungsmethoden vergleichen",
    "transfer.compareDescription":
      "Prüfen Sie Geschwindigkeit, Gebühren und Ausführungszeit, bevor Sie festlegen, wie diese Überweisung gesendet werden soll.",
    "transfer.compareMethod": "Methode",
    "transfer.compareSpeed": "Geschwindigkeit",
    "transfer.compareFees": "Gebühren",
    "transfer.compareDelivery": "Ausführungszeit",
    "transfer.compareFeesPrefix": "Gebühren:",
    "transfer.compareCutoffNote":
      "Tagesgleiche Inlandsüberweisungen hängen von Bankschlusszeiten und Werktagen ab.",
    "settings.title": "Einstellungen",
    "settings.subtitle":
      "Verwalten Sie Ihre persönlichen Daten, Sicherheit und App-Einstellungen.",
    "settings.profileTab": "Profil",
    "settings.securityTab": "Sicherheit",
    "settings.notificationsTab": "Benachrichtigungen",
    "settings.preferencesTab": "Voreinstellungen",
    "settings.preferencesTitle": "App-Einstellungen",
    "settings.preferencesSubtitle":
      "Passen Sie Ihre regionalen und visuellen Einstellungen an.",
    "settings.languageLabel": "Sprache",
    "settings.currencyLabel": "Währung",
    "settings.notification.emailLabel": "E-Mail-Benachrichtigungen",
    "settings.notification.emailDesc":
      "Erhalten Sie Aktualisierungen per E-Mail",
    "settings.notification.smsLabel": "SMS-Benachrichtigungen",
    "settings.notification.smsDesc": "Erhalten Sie Aktualisierungen per SMS",
    "settings.notification.transactionLabel": "Transaktionswarnungen",
    "settings.notification.transactionDesc":
      "Werden Sie über jede Transaktion informiert",
    "settings.notification.pushLabel": "Push-Benachrichtigungen",
    "settings.notification.pushDesc":
      "Erhalten Sie Push-Benachrichtigungen auf Ihren Geräten",
    "error.transfer.selectMethod":
      "Wählen Sie eine Zahlungsart, um fortzufahren.",
    "error.transfer.selectSource": "Bitte wählen Sie ein Quellkonto.",
    "error.transfer.amountRequired":
      "Geben Sie einen Betrag größer als null ein.",
    "error.transfer.amountExceeds":
      "Der Betrag übersteigt den verfügbaren Kontostand.",
    "error.transfer.toAccountRequired":
      "Geben Sie die Kontonummer des Empfängers ein.",
    "error.transfer.descriptionRequired":
      "Fügen Sie einen kurzen Verwendungszweck für diese Überweisung hinzu.",
    "error.transfer.recipientNameRequired":
      "Geben Sie den Namen des Empfängers ein.",
    "error.transfer.swiftRequired": "Geben Sie den SWIFT- / BIC-Code ein.",
    "error.transfer.bankNameRequired": "Geben Sie die Bank des Empfängers ein.",
    "error.transfer.exceedsDailyLimit":
      "Diese Überweisung überschreitet Ihr Tageslimit.",
    "error.transfer.scheduleDateRequired":
      "Wählen Sie ein Datum für diese Überweisung.",
    "error.transfer.scheduleDatePast": "Wählen Sie ein Datum ab heute.",
    "error.transfer.scheduleOccurrencesRequired":
      "Geben Sie an, wie viele Überweisungen erfolgen sollen.",
    "error.transfer.otpRequired":
      "Geben Sie den Verifizierungscode ein, den wir Ihnen gesendet haben.",
    "error.transfer.otpInvalid":
      "Ungültiger oder abgelaufener Code. Versuchen Sie es erneut oder senden Sie ihn erneut.",
    "error.transfer.requestOtpFailed":
      "Verifizierungscode konnte nicht gesendet werden. Versuchen Sie es erneut.",
    "error.transfer.failed":
      "Überweisung fehlgeschlagen. Prüfen Sie die Angaben und versuchen Sie es erneut.",
    "receipt.title": "Überweisung gesendet",
    "receipt.description":
      "Hier finden Sie eine Zusammenfassung Ihrer Überweisung. Sie können diese für Ihre Unterlagen speichern.",
    "receipt.from": "Von",
    "receipt.to": "An",
    "receipt.amount": "Betrag",
    "receipt.method": "Methode",
    "receipt.schedule": "Terminierung",
    "receipt.scheduleNow": "Sofort senden",
    "receipt.reference": "Verwendungszweck",
    "receipt.referenceNotProvided": "Nicht angegeben",
    "receipt.confirmationId": "Bestätigungs-ID",
    "receipt.submittedAt": "Gesendet am",
    "receipt.share": "Teilen",
    "receipt.downloadPdf": "PDF herunterladen",
    "receipt.documentTitle": "Überweisungsbeleg",
    "receipt.documentHeading": "Überweisungsbeleg",
    "common.close": "Schließen",
  },
};

export function translate(language: string, key: string): string {
  const table = messages[language] || messages.en;
  return table[key] || messages.en[key] || key;
}
