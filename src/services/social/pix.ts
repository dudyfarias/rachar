import type { CurrencyCents } from '../../types/billing';
import type { PixProfile } from '../../types/social';

export type PixGatewayProvider = {
  createCharge: (input: PixChargeInput) => Promise<PixCharge>;
  name: string;
};

export type PixChargeInput = {
  amountInCents: CurrencyCents;
  description: string;
  profile: PixProfile;
};

export type PixCharge = {
  amountInCents: CurrencyCents;
  copyPaste: string;
  provider: string;
  qrValue: string;
};

const DEFAULT_MERCHANT_CATEGORY_CODE = '0000';
const GUI_BR_GOV = 'br.gov.bcb.pix';

function removeAccents(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizePixText(value: string, maxLength: number) {
  return removeAccents(value)
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, '')
    .trim()
    .slice(0, maxLength);
}

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function amountAsString(amountInCents: CurrencyCents) {
  return (Math.max(0, amountInCents) / 100).toFixed(2);
}

export function buildStaticPixPayload({ amountInCents, description, profile }: PixChargeInput) {
  const merchantAccountInfo = field('00', GUI_BR_GOV) + field('01', profile.key.trim());
  const txid = sanitizePixText(`${profile.txidPrefix || 'RACHAE'}${Date.now()}`.toUpperCase(), 25) || 'RACHAE';
  const additionalData = field('05', txid);
  const payloadWithoutCrc = [
    field('00', '01'),
    field('01', '12'),
    field('26', merchantAccountInfo),
    field('52', DEFAULT_MERCHANT_CATEGORY_CODE),
    field('53', '986'),
    field('54', amountAsString(amountInCents)),
    field('58', 'BR'),
    field('59', sanitizePixText(profile.receiverName || 'RACHAE', 25).toUpperCase()),
    field('60', sanitizePixText(profile.city || 'SAO PAULO', 15).toUpperCase()),
    field('62', additionalData),
    description ? field('80', sanitizePixText(description, 50)) : '',
  ].join('');
  const payloadForCrc = `${payloadWithoutCrc}6304`;

  return `${payloadForCrc}${crc16(payloadForCrc)}`;
}

export class StaticPixGatewayProvider implements PixGatewayProvider {
  name = 'static-pix-brcode';

  async createCharge(input: PixChargeInput): Promise<PixCharge> {
    const copyPaste = buildStaticPixPayload(input);

    return {
      amountInCents: input.amountInCents,
      copyPaste,
      provider: this.name,
      qrValue: copyPaste,
    };
  }
}

export function createPixGatewayProvider(): PixGatewayProvider {
  return new StaticPixGatewayProvider();
}
