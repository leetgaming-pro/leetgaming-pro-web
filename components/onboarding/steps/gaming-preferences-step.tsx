'use client';

/**
 * Gaming Preferences Step
 * Select favorite games, region, and skill level
 */

import React from 'react';
import {
  Button,
  Chip,
  RadioGroup,
  Radio,
  Switch,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useOnboarding } from '../onboarding-context';
import {
  GameTitle,
  Region,
  SkillLevel,
  PlayStyle,
  GAME_INFO,
  REGION_INFO,
  SKILL_LEVEL_INFO,
} from '../types';

export function GamingPreferencesStep() {
  const { state, updateGamingPreferences, goToNextStep, skipStep } = useOnboarding();
  const { gamingPreferences } = state;

  const toggleGame = (game: GameTitle) => {
    const currentGames = gamingPreferences.games;
    const newGames = currentGames.includes(game)
      ? currentGames.filter((g) => g !== game)
      : [...currentGames, game];

    updateGamingPreferences({
      games: newGames,
      primaryGame: newGames.length === 1 ? newGames[0] : gamingPreferences.primaryGame,
    });
  };

  const isValid = gamingPreferences.games.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Gaming Preferences</h2>
        <p className="text-default-500">
          Help us personalize your experience
        </p>
      </div>

      {/* Game Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Select your games <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(GAME_INFO).map(([game, info]) => {
            const isSelected = gamingPreferences.games.includes(game as GameTitle);
            return (
              <button
                key={game}
                onClick={() => toggleGame(game as GameTitle)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-default-200 hover:border-default-400'}
                `}
              >
                <Icon
                  icon={info.icon}
                  width={24}
                  className="mx-auto mb-1"
                  style={{ color: isSelected ? info.color : undefined }}
                />
                <span className="text-xs font-medium block truncate">
                  {info.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Game */}
      {gamingPreferences.games.length > 1 && (
        <div>
          <label className="text-sm font-medium mb-3 block">Primary Game</label>
          <div className="flex flex-wrap gap-2">
            {gamingPreferences.games.map((game) => (
              <Chip
                key={game}
                variant={gamingPreferences.primaryGame === game ? 'solid' : 'flat'}
                color={gamingPreferences.primaryGame === game ? 'primary' : 'default'}
                className="cursor-pointer"
                onClick={() => updateGamingPreferences({ primaryGame: game })}
              >
                {GAME_INFO[game].name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Region Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">Your Region</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(REGION_INFO).map(([region, info]) => {
            const isSelected = gamingPreferences.region === region;
            return (
              <button
                key={region}
                onClick={() => updateGamingPreferences({ region: region as Region })}
                className={`
                  p-2 rounded-lg border-2 transition-all text-center text-sm
                  ${isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-default-200 hover:border-default-400'}
                `}
              >
                <span className="text-lg block">{info.flag}</span>
                <span className="text-xs truncate block">{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <label className="text-sm font-medium mb-3 block">Skill Level</label>
        <RadioGroup
          value={gamingPreferences.skillLevel || ''}
          onValueChange={(value) => updateGamingPreferences({ skillLevel: value as SkillLevel })}
          orientation="horizontal"
          classNames={{ wrapper: 'gap-2 flex-wrap' }}
        >
          {Object.entries(SKILL_LEVEL_INFO).map(([level, info]) => (
            <Radio
              key={level}
              value={level}
              classNames={{
                base: 'px-3 py-2 rounded-lg border-2 border-default-200 data-[selected=true]:border-primary',
              }}
            >
              <div>
                <span className="font-medium text-sm">{info.name}</span>
                <span className="text-xs text-default-500 block">{info.description}</span>
              </div>
            </Radio>
          ))}
        </RadioGroup>
      </div>

      {/* Play Style */}
      <div>
        <label className="text-sm font-medium mb-3 block">Play Style</label>
        <div className="flex gap-2">
          {[
            { value: PlayStyle.CASUAL, label: 'Casual', icon: 'solar:gamepad-bold' },
            { value: PlayStyle.COMPETITIVE, label: 'Competitive', icon: 'solar:cup-bold' },
            { value: PlayStyle.BOTH, label: 'Both', icon: 'solar:widget-2-bold' },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => updateGamingPreferences({ playStyle: style.value })}
              className={`
                flex-1 p-3 rounded-lg border-2 transition-all text-center
                ${gamingPreferences.playStyle === style.value
                  ? 'border-primary bg-primary/10'
                  : 'border-default-200 hover:border-default-400'}
              `}
            >
              <Icon icon={style.icon} width={24} className="mx-auto mb-1" />
              <span className="text-sm font-medium">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Looking for Team */}
      <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
        <div>
          <p className="font-medium">Looking for a team?</p>
          <p className="text-xs text-default-500">
            We&apos;ll help you find teammates
          </p>
        </div>
        <Switch
          isSelected={gamingPreferences.lookingForTeam}
          onValueChange={(value) => updateGamingPreferences({ lookingForTeam: value })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="flat"
          className="flex-1"
          onPress={skipStep}
        >
          Skip
        </Button>
        <Button
          color="primary"
          className="flex-1"
          endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
          onPress={goToNextStep}
          isDisabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
