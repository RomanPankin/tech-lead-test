'use client';

import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconCheck, IconShieldLock, IconSparkles } from '@tabler/icons-react';
import LeadCaptureForm from '@/components/lead-form/LeadCaptureForm';

/**
 * Landing page UI (split hero + form card). Client component because Mantine's
 * compound components (Grid.Col, List.Item) can't be rendered from a React
 * Server Component. Locale is already set by the server page that renders this.
 */
export default function Landing() {
  const t = useTranslations('Home');
  const benefits = [t('benefit1'), t('benefit2'), t('benefit3')];

  return (
    <Box className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
      <a href="#lead-form" className="skip-link">
        Skip to form
      </a>
      <Container size="lg" py={{ base: 40, md: 80 }} className="w-full">
        <Grid gutter={{ base: 40, md: 64 }} align="center">
          {/* Brand / value panel */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon variant="white" radius="md" size="lg">
                  <IconSparkles size={20} />
                </ThemeIcon>
                <Text fw={700} fz="lg" c="white">
                  {t('brand')}
                </Text>
              </Group>

              <Text tt="uppercase" fw={600} fz="sm" c="indigo.2" className="tracking-[0.08em]">
                {t('eyebrow')}
              </Text>
              <Title order={1} c="white" fz={{ base: 32, md: 46 }} lh={1.08}>
                {t('title')}
              </Title>
              <Text c="indigo.1" fz="lg" maw={460} visibleFrom="md">
                {t('intro')}
              </Text>

              <List
                spacing="sm"
                c="white"
                visibleFrom="md"
                icon={
                  <ThemeIcon color="teal" radius="xl" size={22}>
                    <IconCheck size={14} stroke={3} />
                  </ThemeIcon>
                }
              >
                {benefits.map((b) => (
                  <List.Item key={b}>{b}</List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>

          {/* Form card */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper shadow="xl" radius="lg" withBorder className="p-7 sm:p-10">
              <Stack gap={2} mb="md">
                <Title order={2} fz={{ base: 20, sm: 24 }}>
                  {t('formTitle')}
                </Title>
                <Text c="dimmed" fz="sm">
                  {t('formIntro')}
                </Text>
              </Stack>

              <LeadCaptureForm />

              <Group gap={6} mt="md" c="dimmed">
                <IconShieldLock size={16} />
                <Text fz="xs" c="dimmed">
                  {t('secured')}
                </Text>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
