import { useEditor } from '../hooks';
import { Comment } from './Comment';
import { EditableComponent, EditableComponentProps } from './EditableComponent';

export type EditableAreaProps = {
  children?: React.ReactNode;
  content: any;
  renderArea?: <T extends { children?: React.ReactNode }>(
    props: T
  ) => React.ReactElement;
  renderComponent?: <T extends EditableComponentProps>(
    props: T
  ) => React.ReactElement;
};

export const EditableArea = <
  T extends {} = React.HTMLAttributes<HTMLDivElement>
>({
  children,
  content,
  renderArea: propsRenderArea,
  renderComponent: propsRenderComponent,
  ...props
}: EditableAreaProps & T) => {
  const {
    isEditor,
    renderArea: editorRenderArea,
    renderComponent: editorRenderComponent,
    templateAnnotations
  } = useEditor();

  const renderArea =
    propsRenderArea ?? editorRenderArea ?? (props => <div {...props} />);
  const renderComponent =
    propsRenderComponent ??
    editorRenderComponent ??
    (props => <EditableComponent {...props} />);

  const component = renderArea({
    ...props,
    children: [
      children,
      (content?.['@nodes'] ?? []).map((id: string) =>
        renderComponent({ content: content[id], key: id })
      )
    ]
  });

  if (isEditor) {
    return (
      <Comment
        openComment={templateAnnotations?.[content['@path']]}
        closeComment="/cms:area"
      >
        {component}
      </Comment>
    );
  }

  return component;
};
