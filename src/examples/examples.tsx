/* Usage examples for each primitive — read by /design-sync to build previews
   when no Storybook is present. Not part of the published bundle. */
import React from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Display, Heading1, Heading2, Heading3, Body, LabelText, Mono } from '../components/Typography';
import { ColorSwatch } from '../components/ColorSwatch';
import { Divider } from '../components/Divider';

export function ButtonExample() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  );
}

export function InputExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <Input label="Email" placeholder="you@435group.com" />
      <Input label="Caption" hint="Keep it under 280 characters." />
      <Input label="Handle" defaultValue="@435grp" error hint="This handle is already taken." />
      <Input label="Locked field" defaultValue="Ink #1F2120" disabled />
    </div>
  );
}

export function CardExample() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Card title="Scheduled post" style={{ width: 240 }}>
        <p className="ds-body">Site progress reel — Toowoomba build, day 12.</p>
      </Card>
      <Card variant="inverse" title="45 Investments" style={{ width: 240 }}>
        <p className="ds-body">Quarterly update draft ready for review.</p>
      </Card>
      <Card variant="flat" title="Draft" style={{ width: 240 }}>
        <p className="ds-body">Untitled caption idea.</p>
      </Card>
    </div>
  );
}

export function BadgeExample() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge tone="ink">Published</Badge>
      <Badge tone="sage">Scheduled</Badge>
      <Badge tone="sand">Draft</Badge>
      <Badge tone="stone">Archived</Badge>
      <Badge tone="blush">New</Badge>
    </div>
  );
}

export function TypographyExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Display>435</Display>
      <Heading1>435 Group</Heading1>
      <Heading2>Brand Ecosystem</Heading2>
      <Heading3>Studio</Heading3>
      <Body>Parent holding company spanning all aspects of wealth creation.</Body>
      <LabelText>Group</LabelText>
      <Mono>sketch-2026-05-23-napkin.png</Mono>
    </div>
  );
}

export function ColorSwatchExample() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <ColorSwatch name="ink" />
      <ColorSwatch name="bone" />
      <ColorSwatch name="stone" />
      <ColorSwatch name="sand" />
      <ColorSwatch name="sage" />
      <ColorSwatch name="blush" />
    </div>
  );
}

export function DividerExample() {
  return (
    <div style={{ maxWidth: 320 }}>
      <p className="ds-body">Above the divider.</p>
      <Divider />
      <p className="ds-body">Below the divider.</p>
      <Divider accent />
      <p className="ds-body">Below the accent divider.</p>
    </div>
  );
}
