/**
 * Générateur de fichiers SEPA XML pour l'export TTA
 * Format: SEPA Credit Transfer (SCT) - pain.001.001.03
 */

interface TTAEntryForExport {
  id: string;
  date: Date;
  totalAmount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    badge: string | null;
  };
}

interface SEPAOptions {
  month: number;
  year: number;
  tenantId: string;
}

export function generateSEPA(
  entries: TTAEntryForExport[],
  options: SEPAOptions
): string {
  const { month, year, tenantId } = options;

  // Grouper les entrées par utilisateur
  const userEntries = new Map<string, TTAEntryForExport[]>();
  entries.forEach((entry) => {
    const userId = entry.user.id;
    if (!userEntries.has(userId)) {
      userEntries.set(userId, []);
    }
    userEntries.get(userId)!.push(entry);
  });

  // Calculer les totaux par utilisateur
  const payments = Array.from(userEntries.entries()).map(
    ([userId, userEntriesArray]) => {
      const totalAmount = userEntriesArray.reduce(
        (sum, e) => sum + e.totalAmount,
        0
      );
      const user = userEntriesArray[0].user;
      return {
        userId,
        user,
        amount: totalAmount,
        entries: userEntriesArray,
      };
    }
  );

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const numberOfTransactions = payments.length;

  // Générer un ID de message unique
  const messageId = `TTA-${tenantId.substring(0, 8)}-${year}${month.toString().padStart(2, "0")}-${Date.now()}`;
  const creationDateTime = new Date().toISOString();

  // Construire le XML SEPA
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${creationDateTime}</CreDtTm>
      <NbOfTxs>${numberOfTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>MindSP - SDIS</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${escapeXml(tenantId)}</Id>
            </Othr>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${escapeXml(messageId)}-PMT</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${numberOfTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${getNextBusinessDay()}</ReqdExctnDt>
      <Dbtr>
        <Nm>SDIS - Service Départemental d'Incendie et de Secours</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>FR7612345678901234567890123</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BIC>SOGEFRPPXXX</BIC>
        </FinInstnId>
      </DbtrAgt>
      <ChrgBr>SLEV</ChrgBr>
${payments.map((payment, index) => generateCreditTransferTransaction(payment, index + 1, month, year)).join("\n")}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

  return xml;
}

function generateCreditTransferTransaction(
  payment: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      badge: string | null;
    };
    amount: number;
    entries: TTAEntryForExport[];
  },
  index: number,
  month: number,
  year: number
): string {
  const endToEndId = `TTA-${year}${month.toString().padStart(2, "0")}-${payment.userId.substring(0, 8)}`;

  return `      <CdtTrfTxInf>
        <PmtId>
          <InstrId>${endToEndId}-${index}</InstrId>
          <EndToEndId>${endToEndId}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${payment.amount.toFixed(2)}</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>${escapeXml(`${payment.user.firstName} ${payment.user.lastName}`)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>FR7600000000000000000000000</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>TTA ${month}/${year} - ${payment.entries.length} entrée(s)</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getNextBusinessDay(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  // Si samedi (6) ou dimanche (0), passer au lundi
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return date.toISOString().split("T")[0];
}
