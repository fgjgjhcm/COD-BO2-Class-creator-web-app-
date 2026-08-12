"use client";

type Props = {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
  name?: string;
};

export function VisibilityToggle({
  isPublic,
  onChange,
  disabled,
  name = "visibility",
}: Props) {
  return (
    <fieldset className="community-visibility" disabled={disabled}>
      <legend>Visibility</legend>
      <label className="community-visibility-option">
        <input
          type="radio"
          name={name}
          checked={isPublic}
          onChange={() => onChange(true)}
        />
        <span>
          <strong>Public</strong>
          <em>Visible in community feeds</em>
        </span>
      </label>
      <label className="community-visibility-option">
        <input
          type="radio"
          name={name}
          checked={!isPublic}
          onChange={() => onChange(false)}
        />
        <span>
          <strong>Private</strong>
          <em>Only you (and current emblem display)</em>
        </span>
      </label>
    </fieldset>
  );
}
